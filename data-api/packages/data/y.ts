import { parquetMetadata, type SchemaElement } from "hyparquet";
import fs from "fs";
import path from "path";

const dataDir = path.resolve(__dirname, "../../data-pull");

type enumjson = Record<string, string[]>;

const ireg = /([a-zA-Z_-]+)(_\d{4})?\.parquet/;

type SB = {
  nullable: boolean;
};

type Schema = SB &
  (
    | {
        type: "int";
      }
    | {
        type: "float";
      }
    | {
        type: "boolean";
      }
    | {
        type: "string";
      }
    | {
        type: "enum";
        values: string[];
      }
  );

function pqtoschema(pq: SchemaElement, enums: enumjson, ct: bigint): Schema | null {
  const enumVals = enums[pq.name];
  let nullable = false;
  if (enumVals?.[0] === "") {
    nullable = true;
    enumVals.shift();
  }
  switch (pq.type) {
    case undefined: {
      return null;
    }
    case "BOOLEAN": {
      return {
        nullable,
        type: "boolean",
      };
    }
    case "DOUBLE":
    case "FLOAT": {
      if (enumVals && enumVals.length === 2 && enumVals.includes("0") && enumVals.includes("1")) {
        return {
          nullable,
          type: "boolean",
        };
      }
      return {
        nullable,
        type: "float",
      };
    }
    case "INT32":
    case "INT64": {
      if (enumVals && enumVals.length === 2 && enumVals.includes("0") && enumVals.includes("1")) {
        return {
          nullable,
          type: "boolean",
        };
      }
      return {
        nullable,
        type: "int",
      };
    }
    case "BYTE_ARRAY": {
      // type is mostly a string, check enums
      if (ct < 20n) {
        return {
          nullable,
          type: "string",
        };
      }
      if (!enumVals) {
        return {
          nullable,
          type: "string",
        };
      }
      const enCt = BigInt(enumVals.length);
      if (enCt * 2n <= ct) {
        return {
          nullable,
          type: "enum",
          values: enumVals,
        };
      }
      return {
        nullable,
        type: "string",
      };
    }
  }
  return null;
}

async function processDir(dp: string) {
  const fns = fs.readdirSync(dp).filter((f) => f.endsWith(".parquet"));
  const uniqueTypes = fns
    .map((f) => {
      const match = f.match(ireg);
      if (!match) {
        return [f, f] as const;
      }
      const ug = match[1];
      return [ug ?? f, f] as const;
    })
    .reduce((mp, [g, f]) => {
      mp.set(g, f);
      return mp;
    }, new Map<string, string>());
  const enums = JSON.parse(fs.readFileSync(path.join(dp, "enums.json"), "utf-8")) as enumjson;
  for (const [k, v] of uniqueTypes) {
    const data = await Bun.file(path.join(dp, v)).arrayBuffer();
    const meta = parquetMetadata(data);
    const sf = path.join(dp, `${k}.schema.json`);
    const outputSchema: Record<string, Schema> = {};
    for (const col of meta.schema) {
      const sch = pqtoschema(col, enums, meta.num_rows);
      if (!sch) {
        continue;
      }
      outputSchema[col.name] = sch;
    }
    Bun.write(sf, JSON.stringify(outputSchema, null, 2));
  }
}

const dirents = fs.readdirSync(dataDir, {
  withFileTypes: true,
});
for (const ent of dirents) {
  if (!ent.isDirectory()) {
    continue;
  }
  const dp = path.join(ent.parentPath, ent.name);
  await processDir(dp);
}
