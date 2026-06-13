-- Fix projects INSERT/UPDATE RLS for admin sync and upsert.
-- Run in Supabase SQL Editor (click "Run without RLS" if prompted).
-- Also add SUPABASE_SERVICE_ROLE_KEY to Railway for server-side bulk sync.

DROP POLICY IF EXISTS "Active admin insert projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin update projects" ON public.projects;

CREATE POLICY "Active admin insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());

CREATE POLICY "Active admin update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- Ensure admin user_id is linked (replace email):
-- UPDATE public.admin_users au SET user_id = u.id
-- FROM auth.users u WHERE lower(au.email) = lower('YOUR_EMAIL');
