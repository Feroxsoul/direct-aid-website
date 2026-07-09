-- Supabase Security Advisor follow-ups based on Dashboard findings
-- Issues addressed:
-- - ERROR: RLS Disabled in Public (admin_roles, donations, audit_logs, admin_notifications, media_assets)
-- - WARN: Public bucket allows listing (remove broad SELECT policy)
-- - WARN: Public schema SECURITY DEFINER function (switch to SECURITY INVOKER where safe)
-- - WARN: Signed requests can exec SECURITY DEFINER function (revoke execute for trigger-only helper)

-- 1) Enable RLS on the tables flagged by the advisor (no-op if already enabled).
ALTER TABLE IF EXISTS public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_assets ENABLE ROW LEVEL SECURITY;

-- 2) Prevent public bucket listing for the `media` bucket by dropping broad SELECT policy.
-- Public URLs still work for public buckets; this only blocks listing via API.
DROP POLICY IF EXISTS "Public read media" ON storage.objects;

-- 3) Replace SECURITY DEFINER helper functions with SECURITY INVOKER.
-- This avoids exposing SECURITY DEFINER RPC entrypoints in the public schema.

-- Link-on-signup trigger must remain SECURITY DEFINER (it runs on auth.users insert),
-- but it should not be executable via RPC. Revoke execute from API roles.
REVOKE ALL ON FUNCTION public.link_admin_user_on_signup() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.link_admin_user_on_signup() FROM anon;
REVOKE ALL ON FUNCTION public.link_admin_user_on_signup() FROM authenticated;

-- Helper functions used by RLS + app code: make them SECURITY INVOKER.
-- They rely on RLS on public.admin_users to only see the caller's row.
CREATE OR REPLACE FUNCTION public.get_my_admin_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(role_slug, role::text)
  FROM public.admin_users
  WHERE user_id = auth.uid()
    AND is_active = true
    AND suspended_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND suspended_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND suspended_at IS NULL
      AND COALESCE(role_slug, role::text) = 'super_admin'
  );
$$;

-- Bulk upsert RPC: SECURITY INVOKER is sufficient when project RLS policies are correct.
-- (Admins are authenticated and pass RLS checks.)
CREATE OR REPLACE FUNCTION public.admin_bulk_upsert_projects(payload jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  synced integer := 0;
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'غير مصرح — يجب أن تكون مشرفاً نشطاً مرتبطاً بحسابك';
  END IF;

  IF payload IS NULL OR jsonb_typeof(payload) <> 'array' THEN
    RAISE EXCEPTION 'payload must be a JSON array';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(payload)
  LOOP
    INSERT INTO public.projects (
      slug,
      title,
      image_url,
      image_alt,
      category_slug,
      date_label,
      year_code,
      accent,
      stat_value,
      stat_label,
      icon_url,
      description,
      short_description,
      location,
      gallery_urls,
      status,
      is_published,
      goal_amount,
      amount_raised,
      suggested_donations,
      sort_order
    ) VALUES (
      item->>'slug',
      item->>'title',
      item->>'image_url',
      NULLIF(item->>'image_alt', ''),
      item->>'category_slug',
      item->>'date_label',
      NULLIF(item->>'year_code', ''),
      NULLIF(item->>'accent', ''),
      NULLIF(item->>'stat_value', ''),
      NULLIF(item->>'stat_label', ''),
      NULLIF(item->>'icon_url', ''),
      NULLIF(item->>'description', ''),
      NULLIF(item->>'short_description', ''),
      NULLIF(item->>'location', ''),
      COALESCE(item->'gallery_urls', '[]'::jsonb),
      COALESCE(NULLIF(item->>'status', ''), 'published'),
      COALESCE((item->>'is_published')::boolean, true),
      NULLIF(item->>'goal_amount', '')::numeric,
      COALESCE(NULLIF(item->>'amount_raised', '')::numeric, 0),
      COALESCE(item->'suggested_donations', '[]'::jsonb),
      COALESCE(NULLIF(item->>'sort_order', '')::integer, 0)
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      image_url = EXCLUDED.image_url,
      image_alt = EXCLUDED.image_alt,
      category_slug = EXCLUDED.category_slug,
      date_label = EXCLUDED.date_label,
      year_code = EXCLUDED.year_code,
      accent = EXCLUDED.accent,
      stat_value = EXCLUDED.stat_value,
      stat_label = EXCLUDED.stat_label,
      icon_url = EXCLUDED.icon_url,
      description = EXCLUDED.description,
      short_description = EXCLUDED.short_description,
      location = EXCLUDED.location,
      gallery_urls = EXCLUDED.gallery_urls,
      status = EXCLUDED.status,
      is_published = EXCLUDED.is_published,
      goal_amount = EXCLUDED.goal_amount,
      amount_raised = EXCLUDED.amount_raised,
      suggested_donations = EXCLUDED.suggested_donations,
      sort_order = EXCLUDED.sort_order,
      updated_at = now();

    synced := synced + 1;
  END LOOP;

  RETURN synced;
END;
$$;

