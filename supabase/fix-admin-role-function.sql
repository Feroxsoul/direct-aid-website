-- Run this if apply-existing-db.sql failed partway through.
-- Safe to re-run. Adds missing columns/tables, then fixes functions + policies.

-- ─── Prerequisite schema (skipped if apply-existing-db.sql failed early) ───
DO $$ BEGIN
  CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'editor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role public.admin_role NOT NULL DEFAULT 'admin',
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  badge_color TEXT NOT NULL DEFAULT '#6b7280',
  is_system BOOLEAN NOT NULL DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role_slug TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

UPDATE public.admin_users
SET role_slug = role::text
WHERE role_slug IS NULL;

ALTER TABLE public.admin_users
  ALTER COLUMN role TYPE TEXT USING role::text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS goal_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS amount_raised NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suggested_donations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

UPDATE public.projects
SET status = CASE WHEN is_published THEN 'published' ELSE 'draft' END
WHERE status IS NULL OR status = '';

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug TEXT,
  category_slug TEXT,
  donor_name TEXT,
  donor_email TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  filename TEXT,
  alt_text TEXT,
  size_bytes INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.admin_roles (slug, name, badge_color, is_system, permissions) VALUES
  ('super_admin', 'Super Admin', '#7c3aed', true, '{"*":{"*":true}}'::jsonb),
  ('admin', 'Admin', '#dc2626', true, '{}'::jsonb),
  ('editor', 'Editor', '#ea580c', true, '{}'::jsonb),
  ('content_manager', 'Content Manager', '#0891b2', true, '{}'::jsonb),
  ('donation_manager', 'Donation Manager', '#16a34a', true, '{}'::jsonb),
  ('project_manager', 'Project Manager', '#2563eb', true, '{}'::jsonb),
  ('viewer', 'Viewer', '#6b7280', true, '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ─── Fix auth functions (drop dependents first) ──────────────────
DROP POLICY IF EXISTS "Active admin delete projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin delete media" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;

DROP FUNCTION IF EXISTS public.get_my_admin_role();

CREATE OR REPLACE FUNCTION public.get_my_admin_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role_slug, role::text)
  FROM public.admin_users
  WHERE user_id = auth.uid() AND is_active = true AND suspended_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true AND suspended_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND suspended_at IS NULL
      AND COALESCE(role_slug, role::text) = 'super_admin'
  );
$$;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin manage admin users" ON public.admin_users;

CREATE POLICY "Admins read own profile"
  ON public.admin_users FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Super admin manage admin users"
  ON public.admin_users FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Admin read all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admin update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admin manage statistics" ON public.statistics;
DROP POLICY IF EXISTS "Admin manage pages" ON public.pages;
DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;
DROP POLICY IF EXISTS "Admin upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update media" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;
DROP POLICY IF EXISTS "Active admin read all projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin insert projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin update projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin delete projects" ON public.projects;
DROP POLICY IF EXISTS "Active admin manage categories" ON public.categories;
DROP POLICY IF EXISTS "Active admin manage statistics" ON public.statistics;
DROP POLICY IF EXISTS "Active admin manage pages" ON public.pages;
DROP POLICY IF EXISTS "Active admin manage settings" ON public.settings;
DROP POLICY IF EXISTS "Active admin upload media" ON storage.objects;
DROP POLICY IF EXISTS "Active admin update media" ON storage.objects;
DROP POLICY IF EXISTS "Active admin delete media" ON storage.objects;

CREATE POLICY "Active admin read all projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.is_active_admin());
CREATE POLICY "Active admin insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
CREATE POLICY "Active admin update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Active admin delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.get_my_admin_role() IN ('super_admin', 'admin'));
CREATE POLICY "Active admin manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Active admin manage statistics"
  ON public.statistics FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Active admin manage pages"
  ON public.pages FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Active admin manage settings"
  ON public.settings FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
CREATE POLICY "Active admin upload media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_active_admin());
CREATE POLICY "Active admin update media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_active_admin());
CREATE POLICY "Active admin delete media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.get_my_admin_role() IN ('super_admin', 'admin'));

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active admin read roles" ON public.admin_roles;
CREATE POLICY "Active admin read roles"
  ON public.admin_roles FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "Super admin manage roles" ON public.admin_roles;
CREATE POLICY "Super admin manage roles"
  ON public.admin_roles FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Active admin read donations" ON public.donations;
CREATE POLICY "Active admin read donations"
  ON public.donations FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "Donation managers manage donations" ON public.donations;
CREATE POLICY "Donation managers manage donations"
  ON public.donations FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Super admin read audit logs" ON public.audit_logs;
CREATE POLICY "Super admin read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Active admin insert audit logs" ON public.audit_logs;
CREATE POLICY "Active admin insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Admin read own notifications" ON public.admin_notifications;
CREATE POLICY "Admin read own notifications"
  ON public.admin_notifications FOR SELECT TO authenticated
  USING (target_user_id IS NULL OR target_user_id = auth.uid());

DROP POLICY IF EXISTS "Active admin insert notifications" ON public.admin_notifications;
CREATE POLICY "Active admin insert notifications"
  ON public.admin_notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Active admin update notifications" ON public.admin_notifications;
CREATE POLICY "Active admin update notifications"
  ON public.admin_notifications FOR UPDATE TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "Active admin manage media" ON public.media_assets;
CREATE POLICY "Active admin manage media"
  ON public.media_assets FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

INSERT INTO public.admin_users (email, role, role_slug, display_name, is_active)
VALUES ('demo@directaid10x10.com', 'super_admin', 'super_admin', 'Developer', true)
ON CONFLICT (email) DO UPDATE
SET role = 'super_admin',
    role_slug = 'super_admin',
    is_active = true,
    display_name = EXCLUDED.display_name;

UPDATE public.admin_users au
SET user_id = u.id, updated_at = now()
FROM auth.users u
WHERE lower(au.email) = lower(u.email) AND au.user_id IS NULL;
