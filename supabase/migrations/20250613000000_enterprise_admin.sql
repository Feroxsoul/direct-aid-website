-- Enterprise admin: dynamic roles, permissions, donations, audit, media, notifications

-- ─── Dynamic roles ───────────────────────────────────────────────
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

DROP TRIGGER IF EXISTS admin_roles_set_updated_at ON public.admin_roles;
CREATE TRIGGER admin_roles_set_updated_at
  BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Extend admin_users
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role_slug TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

UPDATE public.admin_users
SET role_slug = role::text
WHERE role_slug IS NULL;

-- Allow dynamic role slugs beyond the original enum
ALTER TABLE public.admin_users
  ALTER COLUMN role TYPE TEXT USING role::text;

-- ─── Project extensions ──────────────────────────────────────────
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

-- ─── Donations ───────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS donations_created_at_idx ON public.donations (created_at DESC);
CREATE INDEX IF NOT EXISTS donations_project_slug_idx ON public.donations (project_slug);

-- ─── Audit logs ──────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

-- ─── Notifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_notifications_user_idx
  ON public.admin_notifications (target_user_id, is_read, created_at DESC);

-- ─── Media library ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  filename TEXT,
  alt_text TEXT,
  size_bytes INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_created_at_idx ON public.media_assets (created_at DESC);

-- ─── Seed default roles (permissions set in app + mirrored here) ─
INSERT INTO public.admin_roles (slug, name, badge_color, is_system, permissions) VALUES
  ('super_admin', 'Super Admin', '#7c3aed', true, '{"*":{"*":true}}'::jsonb),
  ('admin', 'Admin', '#dc2626', true, '{}'::jsonb),
  ('editor', 'Editor', '#ea580c', true, '{}'::jsonb),
  ('content_manager', 'Content Manager', '#0891b2', true, '{}'::jsonb),
  ('donation_manager', 'Donation Manager', '#16a34a', true, '{}'::jsonb),
  ('project_manager', 'Project Manager', '#2563eb', true, '{}'::jsonb),
  ('viewer', 'Viewer', '#6b7280', true, '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- RLS
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

DROP POLICY IF EXISTS "Active admin manage media" ON public.media_assets;
CREATE POLICY "Active admin manage media"
  ON public.media_assets FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());
