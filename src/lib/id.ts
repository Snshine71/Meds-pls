/** Stable id generator. Uses crypto.randomUUID where available. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID.
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function now(): number {
  return Date.now();
}
