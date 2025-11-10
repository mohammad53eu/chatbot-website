export function getEnv(key: string, fallback?: string): string {
  const v = process.env[key];
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env var ${key}`);
  }
  return v;
}

export function getPort(): number {
  return Number(getEnv('PORT', '4000'));
}
