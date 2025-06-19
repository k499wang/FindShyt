-- Add new columns to research_sessions table for custom prompts
ALTER TABLE research_sessions 
ADD COLUMN IF NOT EXISTS custom_email_prompt TEXT,
ADD COLUMN IF NOT EXISTS custom_website_prompt TEXT;

-- Update existing records to set new columns to NULL if they were not present
UPDATE research_sessions 
SET custom_email_prompt = NULL 
WHERE custom_email_prompt IS NOT DISTINCT FROM '';

UPDATE research_sessions 
SET custom_website_prompt = NULL 
WHERE custom_website_prompt IS NOT DISTINCT FROM '';
