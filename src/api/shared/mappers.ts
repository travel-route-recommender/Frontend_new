export type DtoMapper<Dto, Domain> = (dto: Readonly<Dto>) => Domain | undefined;

export function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function finiteNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function stringCoordinate(value: unknown) {
  return finiteNumber(value);
}

export function isoDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : undefined;
}

export function enumValue<Value extends string>(value: unknown, allowed: readonly Value[], fallback: Value) {
  return allowed.includes(value as Value) ? value as Value : fallback;
}

export function arrayOrEmpty<Value>(value: unknown, map: (entry: unknown) => Value | undefined) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const mapped = map(entry);
    return mapped === undefined ? [] : [mapped];
  });
}
