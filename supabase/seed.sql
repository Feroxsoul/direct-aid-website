-- Seed data migrated from development mock content

INSERT INTO public.categories (slug, title_line_1, title_line_2, icon_url, accent, sort_order) VALUES
  ('educational.10x10', 'المشاريع', 'التعليمية', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/63610050d0f67a575ed3ecd6_Education.svg', 'red', 1),
  ('health-10x10', 'المشاريع', 'الصحية', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/6361005099039888194fd661_Health.svg', 'green', 2),
  ('lmshryaa-ldaawy', 'المشاريع', 'الدعوية', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/63610050e0286a567063baf5_Protection.svg', 'olive', 3),
  ('developments', 'المشاريع', 'التنموية', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/638861263306178fc86cd368_Asset%20980.svg', 'blue', 4),
  ('lmshryaa-lgthy', 'المشاريع', 'الإغاثية', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/63610050a4caac2871e76bf6_Food-Security.svg', 'yellow', 5),
  ('orphans', 'مشاريع', 'الأيتام', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/6388608ccb240c085344fc04_Asset%20979.svg', 'orange', 6),
  ('waters-10x10', 'مشاريع', 'المياه', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/6388662476d96e5b12680c98_Asset%20982.svg', 'water', 7),
  ('mosque', 'مشاريع', 'المساجد', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/638864a7e20a48444517d8b4_Asset%20981.svg', 'default', 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.statistics (key, value, label, icon_url, illustration_url, intro_text, sort_order) VALUES
  (
    'homepage_beneficiaries',
    '6,284,069',
    'انسان مستفيد',
    'https://cdn.prod.website-files.com/632a01171b125a156b28c038/6351161938c7c905d020e3c1_Group%2012%20Copy%202.svg',
    'https://cdn.prod.website-files.com/632a01171b125a156b28c038/6354b9eae708dc82e540dd5b_Group%203.svg',
    'مشروع البركة 10×10 من باب مشاركة الأثر معكم نقوم برفع التقارير الخاصة في هذا الموقع بشكل دوري',
    1
  )
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.pages (slug, title, meta_description, content) VALUES
  ('home', '10x10 مشاريع', '10x10 مشاريع', '{"type":"home"}'::jsonb),
  ('category-listing', 'قائمة المشاريع', 'قائمة مشاريع حسب الفئة', '{"type":"category-listing"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.settings (key, value, is_public) VALUES
  ('site_title', '10x10 مشاريع', true),
  ('site_description', '10x10 مشاريع', true),
  ('share_label', 'المشاركة', true),
  ('logo_url', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/64c8cde2258c815c760717a9_small.png', true),
  ('share_icon_url', 'https://cdn.prod.website-files.com/632a01171b125a156b28c038/6354b9e95ee93e437d920d4b_Share.svg', true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.projects (
  slug, title, image_url, category_slug, date_label, year_code, accent, stat_value, stat_label, sort_order
) VALUES
  ('2024slewat5001', 'صيانة ابار', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=680&h=528&fit=crop', 'waters-10x10', 'فبراير 2024', '2024 FEB', 'water', '3,200', 'انسان مستفيد', 1),
  ('2024mliwat5004', 'بئر ارتوازي كبير', 'https://images.unsplash.com/photo-1593113646773-028c64a8f94b?w=680&h=528&fit=crop', 'waters-10x10', 'نوفمبر 2024', '2024 NOV', 'water', NULL, NULL, 2),
  ('2024mliwat5064', 'بئر ارتوازي صغير', 'https://images.unsplash.com/photo-1629073779107-9eb4c1aee1f2?w=680&h=528&fit=crop', 'waters-10x10', 'يونيو 2024', NULL, 'water', NULL, NULL, 3),
  ('water-tank-2024', 'خزان مياه البركة 19', 'https://images.unsplash.com/photo-1541845156444-79bda4d3d0d6?w=680&h=528&fit=crop', 'waters-10x10', 'فبراير 2024', NULL, 'water', NULL, NULL, 4),
  ('health-ct-2024', 'جهاز الأشعة المقطعية لمستشفى جامعة سيمد', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=680&h=528&fit=crop', 'health-10x10', 'يونيو 2024', '2024 JUN', 'green', '12,500', 'انسان مستفيد', 5),
  ('dev-clinic-2023', 'تطوير مستوصف', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=680&h=528&fit=crop', 'health-10x10', 'أبريل 2023', '2023 APR', 'green', NULL, NULL, 6),
  ('health-vaccine-2024', 'حملة تطعيم', 'https://images.unsplash.com/photo-1584036561566-daf0ddf07628?w=680&h=528&fit=crop', 'health-10x10', 'سبتمبر 2024', NULL, 'green', '5,100', 'انسان مستفيد', 7),
  ('edu-books-2023', 'توزيع كتب و مناهج دراسية', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=680&h=528&fit=crop', 'educational.10x10', 'سبتمبر 2023', '2023 SEP', 'red', NULL, NULL, 8),
  ('edu-grant-2024', 'منح تعليم جامعي', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=680&h=528&fit=crop', 'educational.10x10', 'مايو 2024', NULL, 'red', NULL, NULL, 9),
  ('edu-school-2023', 'تغذية مدرسية إغاثية', 'https://images.unsplash.com/photo-1497633768975-8d3aa1c9885f?w=680&h=528&fit=crop', 'educational.10x10', 'مارس 2023', NULL, 'red', NULL, NULL, 10),
  ('relief-yemen-2024', 'إغاثات غذائية عاجلة لليمن', 'https://images.unsplash.com/photo-1488523785073-6df9f2a4b098?w=680&h=528&fit=crop', 'lmshryaa-lgthy', 'اكتوبر 2024', NULL, 'yellow', '8,750', 'انسان مستفيد', 11),
  ('relief-corona-2020', 'إغاثة كورونا لتوزيع الكمامات', 'https://images.unsplash.com/photo-1584036561566-daf0ddf07628?w=680&h=528&fit=crop', 'lmshryaa-lgthy', 'كورونا 2020', NULL, 'yellow', '15,000', 'انسان مستفيد', 12),
  ('relief-food-2024', 'بنك الحبوب', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=680&h=528&fit=crop', 'lmshryaa-lgthy', 'ديسمبر 2024', NULL, 'yellow', NULL, NULL, 13),
  ('dev-clinic-infra', 'ممرات', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=680&h=528&fit=crop', 'developments', 'يونيو 2023', NULL, 'blue', NULL, NULL, 14),
  ('dev-playground', 'ملاعب', 'https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=680&h=528&fit=crop', 'developments', 'أكتوبر 2024', NULL, 'blue', NULL, NULL, 15),
  ('dev-solar', 'طاقة شمسية البركة 48', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=680&h=528&fit=crop', 'developments', 'يوليو 2024', NULL, 'blue', NULL, NULL, 16),
  ('dawah-radio', 'برامج إذاعية', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=680&h=528&fit=crop', 'lmshryaa-ldaawy', 'نوفمبر 2023', NULL, 'olive', NULL, NULL, 17),
  ('dawah-building', 'مبنى إذاعة البركة 14', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=680&h=528&fit=crop', 'lmshryaa-ldaawy', 'مارس 2019', NULL, 'olive', NULL, NULL, 18),
  ('orphans-support-2023', 'أغنوهم عن السؤال', 'https://images.unsplash.com/photo-1488523785073-6df9f2a4b098?w=680&h=528&fit=crop', 'orphans', 'أغسطس 2023', '2023 AUG', 'orange', '420', 'انسان مستفيد', 19),
  ('orphans-sponsor', 'اغنوهم عن السؤال', 'https://images.unsplash.com/photo-1503454537198-1eaff22c8f88?w=680&h=528&fit=crop', 'orphans', 'فبراير 2024', NULL, 'orange', NULL, NULL, 20),
  ('mosque-2024', 'مسجد', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=680&h=528&fit=crop', 'mosque', 'مارس 2023', '2023 MAR', 'default', NULL, NULL, 21),
  ('mosque-renovation', 'صيانة منشآت', 'https://images.unsplash.com/photo-1591604466376-068e5edd577d?w=680&h=528&fit=crop', 'mosque', 'يناير 2024', NULL, 'default', NULL, NULL, 22)
ON CONFLICT (slug) DO NOTHING;
