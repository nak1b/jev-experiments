/* Jev calls cost fractions of a cent, so amounts under a cent keep three significant digits. */
const centsFormat = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
const fractionOfCentFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 3,
});
const countFormat = new Intl.NumberFormat();

export function formatSpend(usd: number | null): string {
  if (usd === null) return "cost unknown";
  return usd === 0 || usd >= 0.01 ? centsFormat.format(usd) : fractionOfCentFormat.format(usd);
}

export function formatCount(value: number): string {
  return countFormat.format(value);
}
