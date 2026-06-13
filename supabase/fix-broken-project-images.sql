-- Remove demo seed projects that use broken Unsplash placeholder images.
-- Real project photos come from Webflow sync (cdn.prod.website-files.com).
-- Safe to run after syncing webflow projects.

DELETE FROM public.projects
WHERE image_url LIKE '%images.unsplash.com%';
