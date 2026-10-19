/**
 * Přesné zaokrouhlení jako Postgres `round(numeric, n)` – polovina od nuly.
 * Vlastní: převod čísla na přesný desetinný zápis (nejkratší řetězec čísla) a výpočty v celých
 *   jednotkách (BigInt), takže 10,075 → 10,08 a −7,875 → −7,88 bez chyb plovoucí čárky.
 * Nesmí: používat Math.round na desetinných hodnotách – dává jiné výsledky než databáze.
 */

/** Přesný zlomek: celé číslo `units` × 10^-`scale`. */
interface Scaled {
  units: bigint;
  scale: number;
}

/** Číslo → přesný desetinný zápis (z nejkratšího řetězce, který číslo jednoznačně určuje). */
function toScaled(value: number): Scaled {
  if (!Number.isFinite(value)) return { units: 0n, scale: 0 };
  const [mantissa, exponentText] = String(value).toLowerCase().split("e");
  const exponent = Number(exponentText ?? 0);
  const negative = mantissa.startsWith("-");
  const [intPart, fracPart = ""] = mantissa.replace("-", "").split(".");
  let digits = `${intPart}${fracPart}`;
  let scale = fracPart.length - exponent;
  if (scale < 0) {
    digits += "0".repeat(-scale);
    scale = 0;
  }
  const units = BigInt(digits || "0");
  return { units: negative ? -units : units, scale };
}

const pow10 = (n: number) => 10n ** BigInt(n);

/** Podíl `numerator / denominator` zaokrouhlený polovinou od nuly na celé jednotky. */
function divRoundHalfAway(numerator: bigint, denominator: bigint): bigint {
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const result = (2n * n + d) / (2n * d);
  return negative ? -result : result;
}

/** Celé jednotky se `decimals` desetinnými místy → číslo. */
const fromUnits = (units: bigint, decimals: number) => Number(units) / 10 ** decimals;

/** Zaokrouhlí polovinou od nuly na `decimals` míst (jako Postgres `round(numeric, n)`). */
export function roundHalfAwayFromZero(value: number, decimals = 2): number {
  const { units, scale } = toScaled(value);
  if (scale <= decimals) return fromUnits(units * pow10(decimals - scale), decimals);
  return fromUnits(divRoundHalfAway(units, pow10(scale - decimals)), decimals);
}

/** Přesný součet čísel (bez chyb plovoucí čárky). */
export function exactSum(values: number[]): number {
  const scaled = values.map(toScaled);
  const scale = Math.max(0, ...scaled.map((item) => item.scale));
  const units = scaled.reduce((acc, item) => acc + item.units * pow10(scale - item.scale), 0n);
  return fromUnits(units, scale);
}

/**
 * Přesně spočte `a × b / c` a zaokrouhlí polovinou od nuly na `decimals` míst
 * (např. daň round(základ × sazba / 100, 2)). Při `c = 0` vrací 0.
 */
export function mulDivRound(a: number, b: number, c: number, decimals = 2): number {
  const x = toScaled(a);
  const y = toScaled(b);
  const z = toScaled(c);
  if (z.units === 0n) return 0;
  // a·b/c = (xu·yu·10^zs) / (zu·10^(xs+ys)); výsledek v jednotkách 10^-decimals.
  const numerator = x.units * y.units * pow10(z.scale + decimals);
  const denominator = z.units * pow10(x.scale + y.scale);
  return fromUnits(divRoundHalfAway(numerator, denominator), decimals);
}

/** Přesně porovná |a × b / c| s limitem bez mezizaokrouhlení; interní kontrola tolerance. */
export function mulDivExceeds(a: number, b: number, c: number, limit: number): boolean {
  const x = toScaled(Math.abs(a));
  const y = toScaled(Math.abs(b));
  const z = toScaled(Math.abs(c));
  const t = toScaled(limit);
  if (z.units === 0n) return false;
  return (
    x.units * y.units * pow10(z.scale + t.scale) > t.units * z.units * pow10(x.scale + y.scale)
  );
}
