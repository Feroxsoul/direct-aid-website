-- Bulk project sync for admin (bypasses RLS via SECURITY DEFINER).
-- Run in Supabase SQL Editor. Click "Run without RLS" if prompted.

CREATE OR REPLACE FUNCTION public.admin_bulk_upsert_projects(payload jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
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

REVOKE ALL ON FUNCTION public.admin_bulk_upsert_projects(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_bulk_upsert_projects(jsonb) TO authenticated;
