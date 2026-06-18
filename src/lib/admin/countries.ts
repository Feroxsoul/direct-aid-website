import type { CountryRow } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetch-all-rows";
import countriesSeed from "@/data/countries-seed.json";

const fallbackCountries = countriesSeed as Omit<
  CountryRow,
  "id" | "created_at" | "updated_at"
>[];

export async function adminGetCountries(): Promise<CountryRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fallbackCountries.map((row, index) => ({
      ...row,
      id: `fallback-${index}`,
      created_at: "",
      updated_at: "",
    }));
  }

  const rows = await fetchAllRows(() =>
    supabase
      .from("countries")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  );

  if (!rows.length) {
    return fallbackCountries.map((row, index) => ({
      ...row,
      id: `fallback-${index}`,
      created_at: "",
      updated_at: "",
    }));
  }

  return rows;
}

export function getCountryName(
  country: CountryRow,
  lang: "ar" | "en" = "ar",
): string {
  return lang === "en" ? country.name_en : country.name_ar;
}
