-- Add Receipt Scanner columns to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ocr_raw TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ocr_parsed JSONB;