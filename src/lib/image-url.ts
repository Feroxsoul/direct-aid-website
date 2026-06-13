/** Normalize Webflow CDN URLs so browsers load filenames with spaces/parentheses. */
export function normalizeCdnImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";

  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes("website-files.com")) {
      return url.trim();
    }

    const segments = parsed.pathname.split("/");
    const file = segments.pop() ?? "";
    const decoded = decodeURIComponent(file);
    const encoded = decoded
      .split("")
      .map((char) => {
        if (/[a-zA-Z0-9._~-]/.test(char)) return char;
        return encodeURIComponent(char);
      })
      .join("");

    parsed.pathname = [...segments, encoded].join("/");
    return parsed.toString();
  } catch {
    return url.trim().replace(/\(/g, "%28").replace(/\)/g, "%29");
  }
}

export function isPlaceholderImageUrl(url: string | null | undefined) {
  return Boolean(url?.includes("images.unsplash.com"));
}
