const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes files from `public/` when the app is hosted below a domain root. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${basePath}${path}`;
}
