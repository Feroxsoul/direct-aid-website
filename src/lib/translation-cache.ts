const STORAGE_KEY = "site-translations-ar-en";

const memory = new Map<string, string>();

function readStorage(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeStorage(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota errors.
  }
}

export function getCachedTranslation(text: string): string | null {
  if (!text.trim()) return text;
  if (memory.has(text)) return memory.get(text)!;

  const stored = readStorage()[text];
  if (stored) {
    memory.set(text, stored);
    return stored;
  }

  return null;
}

export function setCachedTranslation(source: string, translation: string) {
  if (!source.trim() || !translation.trim()) return;
  memory.set(source, translation);
  const stored = readStorage();
  stored[source] = translation;
  writeStorage(stored);
}

export function getCachedTranslations(texts: string[]): (string | null)[] {
  return texts.map((text) => getCachedTranslation(text));
}
