-- Category draft / publish status
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS categories_status_check;

ALTER TABLE categories
  ADD CONSTRAINT categories_status_check
  CHECK (status IN ('draft', 'published'));
