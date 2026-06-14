-- Reset legacy English mockup footer/nav settings to Arabic direct-aid.org defaults.
-- Run once in Supabase SQL editor if the live site still shows English footer or nav labels.

UPDATE settings
SET value = '[
  {
    "title": "عن الجمعية",
    "links": [
      {"href": "https://direct-aid.org/cms/about-us-ar/", "label": "نبذة عن الجمعية"},
      {"href": "https://direct-aid.org/cms/about-us-ar-2/good-governance-in-direct-aid/", "label": "الحوكمة"},
      {"href": "https://direct-aid.org/cms/volunteer-ar/", "label": "التطوع معنا"}
    ]
  },
  {
    "title": "التبرع",
    "links": [
      {"href": "https://direct-aid.org/donate/", "label": "تبرع الآن"},
      {"href": "https://direct-aid.org/cms/how-to-donate-ar/", "label": "كيف تتبرع"},
      {"href": "https://direct-aid.org/cms/donation-policy-ar/", "label": "سياسة التبرع"}
    ]
  },
  {
    "title": "تواصل معنا",
    "links": [
      {"href": "https://direct-aid.org/cms/contact-us-ar/", "label": "اتصل بنا"},
      {"href": "https://direct-aid.org/cms/contact-us-ar/branches-in-kuwait-ar/", "label": "فروع الكويت"},
      {"href": "tel:1866888", "label": "1866888"}
    ]
  }
]'
WHERE key = 'footer_columns_json';

UPDATE settings
SET value = 'جمعية العون المباشر — مؤسسة خيرية كويتية تعمل على تقديم العون الإنساني والتنموي في أكثر من 30 دولة.'
WHERE key = 'footer_tagline';

UPDATE settings
SET value = 'جمعية العون المباشر. جميع الحقوق محفوظة.'
WHERE key = 'footer_copyright';

UPDATE settings
SET value = 'مؤسسة خيرية كويتية غير ربحية — رقم التسجيل 1999/81'
WHERE key = 'footer_legal_line';

UPDATE settings
SET value = '[
  {"label": "Facebook", "href": "https://www.facebook.com/directaidorg/"},
  {"label": "YouTube", "href": "https://www.youtube.com/user/directaidorg"},
  {"label": "X", "href": "https://twitter.com/directaidorg/"},
  {"label": "Instagram", "href": "https://www.instagram.com/directaidorg/"},
  {"label": "Telegram", "href": "https://t.me/directaidorg"}
]'
WHERE key = 'footer_social_json';

-- Nav is no longer rendered on the public site; clear stored English labels.
UPDATE settings
SET value = '[]'
WHERE key = 'header_nav_json';
