"use client";

import { useCallback } from "react";
import {
  getCachedTranslation,
  getCachedTranslations,
  setCachedTranslation,
} from "@/lib/translation-cache";

export function useTranslate() {
  const translate = useCallback(async (text: string): Promise<string> => {
    const trimmed = text.trim();
    if (!trimmed) return text;

    const cached = getCachedTranslation(trimmed);
    if (cached) return cached;

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [trimmed] }),
    });

    if (!response.ok) return text;

    const payload = (await response.json()) as { translations?: string[] };
    const translated = payload.translations?.[0]?.trim() || text;
    setCachedTranslation(trimmed, translated);
    return translated;
  }, []);

  const translateMany = useCallback(async (texts: string[]): Promise<string[]> => {
    const normalized = texts.map((text) => text.trim());
    const cached = getCachedTranslations(normalized);
    const missingIndexes: number[] = [];
    const results = [...normalized];

    cached.forEach((value, index) => {
      if (value) {
        results[index] = value;
      } else if (normalized[index]) {
        missingIndexes.push(index);
      }
    });

    if (!missingIndexes.length) return results;

    const missingTexts = missingIndexes.map((index) => normalized[index]);
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: missingTexts }),
    });

    if (!response.ok) return results;

    const payload = (await response.json()) as { translations?: string[] };
    missingIndexes.forEach((sourceIndex, resultIndex) => {
      const translated = payload.translations?.[resultIndex]?.trim();
      if (!translated) return;
      setCachedTranslation(normalized[sourceIndex], translated);
      results[sourceIndex] = translated;
    });

    return results;
  }, []);

  return { translate, translateMany };
}
