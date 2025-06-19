-- Create user_research table
CREATE TABLE IF NOT EXISTS user_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL DEFAULT '',
    research_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create research_sessions table
CREATE TABLE IF NOT EXISTS research_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_results JSONB,
    scraped_content JSONB,
    generated_email JSONB,
    generated_website JSONB,
    email_subject TEXT,
    email_style TEXT,
    website_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_research
CREATE POLICY "Users can view own research data" ON user_research
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research data" ON user_research
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research data" ON user_research
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for research_sessions
CREATE POLICY "Users can view own research sessions" ON research_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research sessions" ON research_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_research_user_id ON user_research(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_created_at ON research_sessions(created_at DESC);
