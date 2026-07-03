-- Run this entire file in Supabase → SQL Editor (once).
-- Fixes: "Could not find the 'country_slug' column of 'projects' in the schema cache"

-- ── 1. Category slug keys ──────────────────────────────────────────────────
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS slug_key TEXT;

UPDATE public.categories SET slug_key = CASE slug
  WHEN 'health-10x10' THEN 'health'
  WHEN 'educational.10x10' THEN 'education'
  WHEN 'lmshryaa-ldaawy' THEN 'dawah'
  WHEN 'developments' THEN 'development'
  WHEN 'lmshryaa-lgthy' THEN 'relief'
  WHEN 'orphans' THEN 'orphans'
  WHEN 'waters-10x10' THEN 'water'
  WHEN 'mosque' THEN 'mosque'
  ELSE regexp_replace(lower(slug), '[^a-z0-9]+', '', 'g')
END
WHERE slug_key IS NULL;

UPDATE public.categories SET name_en = CASE slug
  WHEN 'health-10x10' THEN 'Health'
  WHEN 'educational.10x10' THEN 'Education'
  WHEN 'lmshryaa-ldaawy' THEN 'Dawah'
  WHEN 'developments' THEN 'Development'
  WHEN 'lmshryaa-lgthy' THEN 'Relief'
  WHEN 'orphans' THEN 'Orphans'
  WHEN 'waters-10x10' THEN 'Water'
  WHEN 'mosque' THEN 'Mosque'
  ELSE initcap(slug_key)
END
WHERE name_en IS NULL;

UPDATE public.categories SET slug_key = regexp_replace(lower(slug), '[^a-z0-9]+', '', 'g')
WHERE slug_key IS NULL OR slug_key = '';

ALTER TABLE public.categories
  ALTER COLUMN slug_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key_idx ON public.categories (slug_key);

-- ── 2. Countries table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS countries_set_updated_at ON public.countries;
CREATE TRIGGER countries_set_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active countries" ON public.countries;
CREATE POLICY "Public read active countries"
  ON public.countries FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Active admin manage countries" ON public.countries;
CREATE POLICY "Active admin manage countries"
  ON public.countries FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- ── 3. Project columns (this fixes the schema cache error) ─────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_month INTEGER CHECK (project_month BETWEEN 1 AND 12),
  ADD COLUMN IF NOT EXISTS project_year INTEGER CHECK (project_year BETWEEN 1900 AND 2100),
  ADD COLUMN IF NOT EXISTS country_slug TEXT;

-- Add FK only if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_country_slug_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_country_slug_fkey
      FOREIGN KEY (country_slug) REFERENCES public.countries (slug) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS projects_country_slug_idx ON public.projects (country_slug);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects (created_at DESC);
CREATE INDEX IF NOT EXISTS projects_category_date_idx
  ON public.projects (category_slug, project_year, project_month);

-- ── 4. Seed countries (required before sync sets country_slug) ─────────────
INSERT INTO public.countries (slug, name_en, name_ar, sort_order, is_active) VALUES
  ('comoros', 'Comoros', 'جزر القمر', 1, true),
  ('zambia', 'Zambia', 'زامبيا', 2, true),
  ('kenya', 'Kenya', 'كينيا', 3, true),
  ('sierra-leone', 'Sierra Leone', 'سيراليون', 4, true),
  ('mali', 'Mali', 'مالي', 5, true),
  ('burkina-faso', 'Burkina Faso', 'بوركينا فاسو', 6, true),
  ('senegal', 'Senegal', 'السنغال', 7, true),
  ('ghana', 'Ghana', 'غانا', 8, true),
  ('benin', 'Benin', 'بنين', 9, true),
  ('غينيا-بيساو', 'Guinea-Bissau', 'غينيا بيساو', 10, true),
  ('توغو', 'Togo', 'توغو', 11, true),
  ('uganda', 'Uganda', 'أوغندا', 12, true),
  ('أثيوبيا', 'Ethiopia', 'أثيوبيا', 13, true),
  ('tanzania', 'Tanzania', 'تنزانيا', 14, true),
  ('gambia', 'Gambia', 'غامبيا', 15, true),
  ('madagascar', 'Madagascar', 'مدغشقر', 16, true),
  ('niger', 'Niger', 'النيجر', 17, true),
  ('mozambique', 'Mozambique', 'موزمبيق', 18, true),
  ('رواندا', 'Rwanda', 'رواندا', 19, true),
  ('chad', 'Chad', 'تشاد', 20, true),
  ('دول-متعددة', 'Multiple countries', 'دول متعددة', 21, true),
  ('غينيا-كوناكري', 'Guinea', 'غينيا كوناكري', 22, true),
  ('somalia', 'Somalia', 'الصومال', 23, true),
  ('yemen', 'Yemen', 'اليمن', 24, true),
  ('mauritania', 'Mauritania', 'موريتانيا', 25, true),
  ('تونس', 'Tunisia', 'تونس', 26, true),
  ('sudan', 'Sudan', 'السودان', 27, true),
  ('زيمبابوي', 'Zimbabwe', 'زيمبابوي', 28, true),
  ('زنجبار', 'Zanzibar', 'زنجبار', 29, true)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- ── 5. Refresh PostgREST schema cache ──────────────────────────────────────
NOTIFY pgrst, 'reload schema';
