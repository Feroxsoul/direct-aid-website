-- Per-user hidden admin pages (Super Admin controlled)
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS nav_hidden_pages jsonb NOT NULL DEFAULT '[]'::jsonb;
