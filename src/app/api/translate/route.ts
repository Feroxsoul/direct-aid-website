import { NextResponse } from "next/server";

type TranslateBody = {
  texts?: string[];
};

async function translateChunk(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", trimmed.slice(0, 500));
  url.searchParams.set("langpair", "ar|en");

  const response = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!response.ok) return text;

  const payload = (await response.json()) as {
    responseData?: { translatedText?: string };
  };

  const translated = payload.responseData?.translatedText?.trim();
  if (!translated || translated.toUpperCase() === trimmed.toUpperCase()) {
    return text;
  }

  return translated;
}

function splitForTranslation(text: string, max = 450): string[] {
  if (text.length <= max) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > max) {
    let splitAt = remaining.lastIndexOf(". ", max);
    if (splitAt < max * 0.5) splitAt = remaining.lastIndexOf(" ", max);
    if (splitAt < max * 0.5) splitAt = max;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

async function translateOne(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const chunks = splitForTranslation(trimmed);
  if (chunks.length === 1) return translateChunk(chunks[0]);

  const translated = await Promise.all(chunks.map((chunk) => translateChunk(chunk)));
  return translated.join(" ");
}

export async function POST(request: Request) {
  let body: TranslateBody;

  try {
    body = (await request.json()) as TranslateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const texts = Array.isArray(body.texts) ? body.texts.filter((text) => typeof text === "string") : [];
  if (!texts.length) {
    return NextResponse.json({ translations: [] });
  }

  if (texts.length > 20) {
    return NextResponse.json({ error: "Too many texts in one request" }, { status: 400 });
  }

  const translations = await Promise.all(texts.map((text) => translateOne(text)));
  return NextResponse.json({ translations });
}
