/** Backend contract unchanged: numbers are stored/sent as 0XXXXXXXXX. */
export function isValidLocalPhone(digits: string): boolean {
  return /^[789]\d{9}$/.test(digits);
}

/** Prefixes a local 10-digit entry with the leading zero. */
export function toStoredPhone(digits: string): string {
  return `0${digits}`;
}
