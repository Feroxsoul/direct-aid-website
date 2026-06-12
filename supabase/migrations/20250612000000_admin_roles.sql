-- Role-based admin access for Direct Aid 10x10

CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'editor');

CREATE TABLE public.admin_users (
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

CREATE TRIGGER admin_users_set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX admin_users_user_id_idx ON public.admin_users (user_id);
CREATE INDEX admin_users_email_idx ON public.admin_users (email);

-- Link pre-registered admin email when auth user is created
CREATE OR REPLACE FUNCTION public.link_admin_user_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_users
  SET user_id = NEW.id, updated_at = now()
  WHERE lower(email) = lower(NEW.email) AND user_id IS NULL;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_link_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_admin_user_on_signup();

CREATE OR REPLACE FUNCTION public.get_my_admin_role()
RETURNS public.admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.admin_users
  WHERE user_id = auth.uid() AND is_active = true
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
    WHERE user_id = auth.uid() AND is_active = true
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
    WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read own profile"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Super admin manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Replace open authenticated policies with active-admin checks
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

-- Register developer as super admin (update email if needed)
INSERT INTO public.admin_users (email, role, display_name, is_active)
VALUES ('demo@directaid10x10.com', 'super_admin', 'Developer', true)
ON CONFLICT (email) DO UPDATE
SET role = 'super_admin', is_active = true, display_name = EXCLUDED.display_name;

-- Link if auth user already exists
UPDATE public.admin_users au
SET user_id = u.id, updated_at = now()
FROM auth.users u
WHERE lower(au.email) = lower(u.email) AND au.user_id IS NULL;
