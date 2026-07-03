"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { useTranslate } from "@/hooks/use-translate";
import { usePublicLocale } from "@/lib/public-locale-context";
import { localizeProjectCard } from "@/lib/site-localize";
import type { ProjectCardData } from "@/types";

function hasStoredEnglish(project: ProjectCardData) {
  return Boolean(
    project.titleEn?.trim() ||
      project.descriptionEn?.trim() ||
      project.statLabelEn?.trim(),
  );
}

export function useLocalizedProject(project: ProjectCardData) {
  const { lang, countryMaps } = usePublicLocale();
  const { translateMany } = useTranslate();
  const [translated, setTranslated] = useState<{
    title?: string;
    description?: string;
    categoryLabel?: string;
    statistics?: { label?: string };
  }>({});

  const textsKey = useMemo(
    () =>
      [
        project.title,
        project.description ?? "",
        project.categoryLabel ?? "",
        project.statistics?.label ?? "",
        project.titleEn ?? "",
        project.descriptionEn ?? "",
      ].join("\u0001"),
    [project],
  );

  useEffect(() => {
    if (lang === "ar") {
      setTranslated({});
      return;
    }

    if (hasStoredEnglish(project)) {
      setTranslated({});
      return;
    }

    let cancelled = false;

    async function run() {
      const fields = [
        project.title,
        project.description ?? "",
        project.statistics?.label ?? "",
      ];
      if (!project.categorySlug && project.categoryLabel) {
        fields.push(project.categoryLabel);
      }

      const pending = fields.filter((text) => text.trim().length > 0);

      if (!pending.length) {
        setTranslated({});
        return;
      }

      const unique = [...new Set(pending)];
      const translations = await translateMany(unique);
      const map = new Map(unique.map((text, index) => [text, translations[index]]));

      if (cancelled) return;

      setTranslated({
        title: map.get(project.title),
        description: project.description ? map.get(project.description) : undefined,
        categoryLabel: project.categoryLabel ? map.get(project.categoryLabel) : undefined,
        statistics: project.statistics?.label
          ? { label: map.get(project.statistics.label) }
          : undefined,
      });
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [lang, textsKey, project, translateMany]);

  return useMemo(
    () => ({
      ...project,
      ...localizeProjectCard(project, lang, {
        countryBySlug: countryMaps.bySlug,
        countryByNameAr: countryMaps.nameEnByAr,
        translated,
      }),
    }),
    [project, lang, countryMaps, translated],
  );
}
