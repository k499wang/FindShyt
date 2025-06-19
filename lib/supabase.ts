import { createClient } from "@supabase/supabase-js"
import { createBrowserClient } from '@supabase/ssr'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// createClientBrowser
export function createClientBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


export type Database = {
  public: {
    Tables: {
      user_research: {
        Row: {
          id: string
          user_id: string
          query: string
          research_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          research_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          research_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      research_sessions: {
        Row: {
          id: string
          user_id: string
          query: string
          search_results: any
          scraped_content: any
          generated_email: any
          generated_website: any
          email_subject: string
          email_style: string
          website_style: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          search_results?: any
          scraped_content?: any
          generated_email?: any
          generated_website?: any
          email_subject?: string
          email_style?: string
          website_style?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          search_results?: any
          scraped_content?: any
          generated_email?: any
          generated_website?: any
          email_subject?: string
          email_style?: string
          website_style?: string
          created_at?: string
        }
      }
    }
  }
}
