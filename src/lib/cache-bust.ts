const BUILD_TS = import.meta.env.VITE_BUILD_TS ?? "";

export function cacheBust(url: string): string {
  if (!url || !BUILD_TS) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${BUILD_TS}`;
}
