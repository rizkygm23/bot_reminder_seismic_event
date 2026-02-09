-- =============================================
-- SQL Query untuk membuat tabel reminder bot
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Table untuk menyimpan subscribers
CREATE TABLE IF NOT EXISTS reminder_subscribers (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT UNIQUE NOT NULL,
    first_name VARCHAR(255),
    username VARCHAR(255),
    events TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mempercepat query berdasarkan chat_id
CREATE INDEX IF NOT EXISTS idx_subscribers_chat_id ON reminder_subscribers(chat_id);

-- Index untuk mempercepat query berdasarkan events (untuk mencari subscriber per event)
CREATE INDEX IF NOT EXISTS idx_subscribers_events ON reminder_subscribers USING GIN(events);

-- Enable Row Level Security
ALTER TABLE reminder_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy untuk allow semua operasi (karena bot yang akses, bukan user langsung)
-- Gunakan service role key untuk bypass RLS, atau buat policy allow all
CREATE POLICY "Allow all operations for reminder bot" ON reminder_subscribers
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at saat row di-update
DROP TRIGGER IF EXISTS update_reminder_subscribers_updated_at ON reminder_subscribers;
CREATE TRIGGER update_reminder_subscribers_updated_at
    BEFORE UPDATE ON reminder_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
