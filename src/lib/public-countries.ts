import countriesSeed from "@/data/countries-seed.json";
import { formatEnglishCountryName } from "@/lib/site-localize";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetch-all-rows";
import type { CountryRow } from "@/types";

export type PublicCountryMaps = {
  bySlug: Record<string, CountryRow>;
  nameEnByAr: Record<string, string>;
};

function buildCountryMaps(rows: CountryRow[]): PublicCountryMaps {
  const bySlug: Record<string, CountryRow> = {};
  const nameEnByAr: Record<string, string> = {};

  for (const row of rows) {
    bySlug[row.slug] = row;
    nameEnByAr[row.name_ar.trim()] = formatEnglishCountryName(row.name_en);
  }

  return { bySlug, nameEnByAr };
}

export async function getPublicCountryMaps(): Promise<PublicCountryMaps> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return buildCountryMaps(
      (countriesSeed as Omit<CountryRow, "id" | "created_at" | "updated_at">[]).map(
        (row, index) => ({
          ...row,
          id: `seed-${index}`,
          created_at: "",
          updated_at: "",
        }),
      ),
    );
  }

  const rows = await fetchAllRows(() =>
    supabase
      .from("countries")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  );

  if (!rows.length) {
    return buildCountryMaps(
      (countriesSeed as Omit<CountryRow, "id" | "created_at" | "updated_at">[]).map(
        (row, index) => ({
          ...row,
          id: `seed-${index}`,
          created_at: "",
          updated_at: "",
        }),
      ),
    );
  }

  return buildCountryMaps(rows);
}
