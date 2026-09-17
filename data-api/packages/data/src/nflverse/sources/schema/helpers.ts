import { z } from "zod";

export const nullableInt = z.number().int().nullish();

export const nullableFloat = z.number().nullish();

export const boolFromBinary = z.preprocess(
  (v) => (v == null ? false : typeof v === "number" ? v !== 0 : v),
  z.union([z.stringbool(), z.boolean()]),
);

export const nullableBoolFromBinary = z.preprocess(
  (v) => (v == null ? null : typeof v === "number" ? v !== 0 : v),
  z.union([z.stringbool(), z.boolean(), z.null()]),
);

export const nullableString = z.preprocess(
  (v) => (v === undefined ? null : v),
  z.union([z.string(), z.null()]).transform((v) => {
    if (v === null) {
      return null;
    }
    const trimmed = v.trim();
    return trimmed.length ? trimmed : null;
  }),
);

export const coercedNullableString = z.unknown().transform((v) => {
  if (v === null || v === undefined) {
    return null;
  }
  const trimmed = String(v).trim();
  return trimmed.length ? trimmed : null;
});

export const nullableStringOf = <T extends z.ZodType<unknown, string>>(sch: T) =>
  z.pipe(nullableString, z.union([z.null(), sch]));

export const hexColor = z.string().regex(/^#[A-Fa-f0-9]{6}$/);

export const nullableHexColor = z.preprocess((v) => (!v ? null : v), z.union([z.null(), hexColor]));

export const urlSchema = z.url();

export const nullableCodeString = <T extends z.ZodType<unknown, string>>(sch: T) =>
  z.preprocess((v) => (v === "0" ? null : v), nullableStringOf(sch));

export const NFLVERSE_TIMEZONE = "America/New_York";

export const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const SLASH_DATE =
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;

export const HAS_TIMEZONE = /(?:Z|[+-]\d{2}:?\d{2}|GMT[+-]\d{4})$/i;

// Tolerant date parsing: accepts Date objects, epoch millis, ISO date/datetime
// strings, "M/D/YY[, H:mm:ss]" strings and human-readable strings. Wall-clock
// values without an explicit offset are interpreted in America/New_York (EST/EDT).
function timeZoneOffsetMs(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: NFLVERSE_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUtc - date.getTime();
}

function zonedTimeToDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  return new Date(guess - timeZoneOffsetMs(new Date(guess)));
}

function parseDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") {
    return null;
  }
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : v;
  }
  if (typeof v === "number") {
    return new Date(v);
  }
  if (typeof v !== "string") {
    return null;
  }
  const s = v.trim();
  if (!s) {
    return null;
  }
  const isoDate = ISO_DATE.exec(s);
  if (isoDate) {
    return zonedTimeToDate(Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]));
  }
  const slash = SLASH_DATE.exec(s);
  if (slash) {
    let year = Number(slash[3]);
    if (year < 100) {
      year += 2000;
    }
    return zonedTimeToDate(
      year,
      Number(slash[1]),
      Number(slash[2]),
      Number(slash[4] ?? 0),
      Number(slash[5] ?? 0),
      Number(slash[6] ?? 0),
    );
  }
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  if (HAS_TIMEZONE.test(s)) {
    return parsed;
  }
  return zonedTimeToDate(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth() + 1,
    parsed.getUTCDate(),
    parsed.getUTCHours(),
    parsed.getUTCMinutes(),
    parsed.getUTCSeconds(),
  );
}

export const nullableDate = z.unknown().transform((v) => parseDate(v));
