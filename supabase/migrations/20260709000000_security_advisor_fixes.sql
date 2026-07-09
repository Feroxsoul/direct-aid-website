-- Supabase Security Advisor fixes
-- - Tighten overly-permissive RLS write policies (USING/WITH CHECK true)
-- - Ensure RLS is enabled on API-exposed public tables
-- - Pin function search_path (function_search_path_mutable)
-- - Prevent public bucket listing by removing broad SELECT policy

-- 1) Pin search_path for helper trigger function (linter: function_search_path_mutable)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Ensure RLS is enabled on all app tables in public schema.
-- (If any of these are already enabled, this is a no-op.)
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_assets ENABLE ROW LEVEL SECURITY;

-- 3) Replace legacy "Admin *" policies that used USING/WITH CHECK (true).
-- These are flagged as overly-permissive by the advisor.
DROP POLICY IF EXISTS "Admin read all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admin update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admin manage statistics" ON public.statistics;
DROP POLICY IF EXISTS "Admin manage pages" ON public.pages;
DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;

-- Recreate the intended Active-admin policies (idempotent).
DROP POLICY IF EXISTS "Active admin read all projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin insert projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin update projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin delete projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin manage categories" ON public.categories;
DROP POLICY IF EXISTS "Active admin manage statistics" ON public.statistics;
DROP POLICY IF EXISTS "Active admin manage pages" ON public.pages;
DROP POLICY IF EXISTS "Active admin manage settings" ON public.settings;

CREATE POLICY "Active admin read all projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "Active admin insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());

CREATE POLICY "Active admin update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

CREATE POLICY "Active admin delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.get_my_admin_role() IN ('super_admin', 'admin'));

CREATE POLICY "Active admin manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

CREATE POLICY "Active admin manage statistics"
  ON public.statistics FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

CREATE POLICY "Active admin manage pages"
  ON public.pages FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

CREATE POLICY "Active admin manage settings"
  ON public.settings FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- 4) Storage policies
-- Remove broad SELECT policy on a public bucket to avoid "public bucket allows listing".
-- Public buckets do not need a SELECT policy for public object URL access, but they do for listing.
DROP POLICY IF EXISTS "Public read media" ON storage.objects;

-- Remove legacy write policies and re-add tighter ones.
DROP POLICY IF EXISTS "Admin upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update media" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;
DROP POLICY IF EXISTS "Active admin upload media" ON storage.objects;
DROP POLICY IF EXISTS "Active admin update media" ON storage.objects;
DROP POLICY IF EXISTS "Active admin delete media" ON storage.objects;

CREATE POLICY "Active admin upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_active_admin());

CREATE POLICY "Active admin update media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_active_admin());

CREATE POLICY "Active admin delete media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.get_my_admin_role() IN ('super_admin', 'admin'));

