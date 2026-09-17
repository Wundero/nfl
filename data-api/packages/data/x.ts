import { parseBlob, parseBinary } from "web-csv-toolbox";
import { parquetReadObjects, type AsyncBuffer } from "hyparquet";
import fs from "fs";
import path from "path";
import sj from "superjson";

const dataDir = path.resolve(__dirname, "../../data-pull");

async function getCSVGZUniques(b: Bun.BunFile, out: Map<string, Set<string>>) {
  const bytes = await b.arrayBuffer();
  const decoded = Bun.gunzipSync(bytes);
  const iter = parseBinary(decoded);

  for await (const value of iter) {
    Object.entries(value).forEach(([k, v]) => {
      const set = out.get(k) ?? new Set();
      set.add(v);
      out.set(k, set);
    });
  }
  return out;
}

async function getCSVUniques(b: Bun.BunFile, out: Map<string, Set<string>>) {
  const iter = parseBlob(b);

  for await (const value of iter) {
    Object.entries(value).forEach(([k, v]) => {
      const set = out.get(k) ?? new Set();
      set.add(v);
      out.set(k, set);
    });
  }
  return out;
}

async function bfToAsyncBuffer(b: Bun.BunFile): Promise<AsyncBuffer> {
  const stat = await b.stat();
  return {
    byteLength: stat.size,
    async slice(start, end) {
      const bSlice = b.slice(start, end);
      return await bSlice.arrayBuffer();
    },
  };
}

async function getParquetUniques(b: Bun.BunFile, out: Map<string, Set<string>>) {
  const d = await b.arrayBuffer();
  const rows = await parquetReadObjects({
    file: d,
  });
  const used = new Set<string>();
  for (const value of rows) {
    Object.entries(value).forEach(([k, v]) => {
      used.add(k);
      const set = out.get(k) ?? new Set();
      let str: string;
      if (v === null || v === undefined) {
        str = "";
      } else {
        str = String(v);
      }
      set.add(str);
      out.set(k, set);
    });
  }
  out.forEach((v, k) => {
    if (!used.has(k)) {
      v.add("");
    }
  });
  return out;
}

async function processDir(d: string) {
  console.log("Processing", d);
  const ep = path.join(d, "enums.json");
  const enumFile = Bun.file(ep);
  const dir = await fs.promises.readdir(d);
  const mp = new Map<string, Set<string>>();
  for (const fn of dir) {
    const bf = Bun.file(path.join(d, fn));
    if (fn.endsWith(".csv")) {
      await getCSVUniques(bf, mp);
      continue;
    }
    if (fn.endsWith(".csv.gz")) {
      await getCSVGZUniques(bf, mp);
      continue;
    }
    if (fn.endsWith(".parquet")) {
      await getParquetUniques(bf, mp);
      continue;
    }
  }
  const output: Record<string, string[]> = {};
  mp.forEach((v, k) => {
    const oa = [];
    for (const vi of v) {
      if (!vi) {
        oa.unshift(vi);
        continue;
      }
      oa.push(vi);
    }
    output[k] = oa;
  });
  await enumFile.write(JSON.stringify(output, null, 2));
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
