-- Run in Supabase SQL Editor (full file, top to bottom)

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
  ADD COLUMN IF NOT EXISTS stat_label_en TEXT;

ALTER TABLE public.statistics
  ADD COLUMN IF NOT EXISTS label_en TEXT,
  ADD COLUMN IF NOT EXISTS intro_text_en TEXT;
