-- Editable homepage stats branding and box color (stored in settings)

INSERT INTO public.settings (key, value, is_public) VALUES
  ('stats_brand_line_1', 'عشرة', true),
  ('stats_brand_line_2', '10×10', true),
  ('stats_box_color', '#e2eed6', true)
ON CONFLICT (key) DO NOTHING;
