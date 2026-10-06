-- ============================================================
-- Migration: Add status & follow-up linking to counseling_sessions
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add session status column
ALTER TABLE counseling_sessions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'
CHECK (status IN ('open', 'follow_up_scheduled', 'completed'));

-- 2. Add parent session link for follow-up chains
ALTER TABLE counseling_sessions
ADD COLUMN IF NOT EXISTS parent_session_id UUID REFERENCES counseling_sessions(id) ON DELETE SET NULL;

-- 3. Back-fill existing rows: mark sessions WITH a follow_up_date as 'follow_up_scheduled',
--    and sessions WITHOUT one as 'completed'
UPDATE counseling_sessions
SET status = CASE
  WHEN follow_up_date IS NOT NULL AND follow_up_date >= CURRENT_DATE THEN 'follow_up_scheduled'
  ELSE 'completed'
END;
