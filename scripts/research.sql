-- Add new columns to research_sessions table for state management
ALTER TABLE research_sessions 
ADD COLUMN IF NOT EXISTS current_step TEXT DEFAULT 'input',
ADD COLUMN IF NOT EXISTS selected_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scrape_statuses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for better performance on updated_at
CREATE INDEX IF NOT EXISTS idx_research_sessions_updated_at ON research_sessions(updated_at DESC);

-- Create index for current_step filtering
CREATE INDEX IF NOT EXISTS idx_research_sessions_current_step ON research_sessions(current_step);

-- Update existing records to have updated_at = created_at if null
UPDATE research_sessions 
SET updated_at = created_at 
WHERE updated_at IS NULL;
