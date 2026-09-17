/** Resolve a path under `public/` with the Vite base (e.g. `/GoldFynch/` on Pages). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}${path.replace(/^\//, '')}`
}
