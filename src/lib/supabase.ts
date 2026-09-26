import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PORTFOLIO_DATA } from "./portfolio-data";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

export function getSupabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && url.startsWith("http"));
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (url && key && url.startsWith("http")) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      return null;
    }
  }

  return null;
}

export const SUPABASE_SQL_SCHEMA = `-- Supabase SQL Schema for Guy Tibro Portfolio
-- Run this in your Supabase Project -> SQL Editor -> New query -> Run

-- 1. Create Portfolio Settings & Content Table
CREATE TABLE IF NOT EXISTS public.portfolio_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_content ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Public Read Access"
  ON public.portfolio_content
  FOR SELECT
  USING (true);

-- Allow Authenticated / Service Role Write Access
CREATE POLICY "Admin Write Access"
  ON public.portfolio_content
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert Initial Portfolio Data
INSERT INTO public.portfolio_content (id, data, updated_at)
VALUES (
  'main',
  '${JSON.stringify(DEFAULT_PORTFOLIO_DATA).replace(/'/g, "''")}'::jsonb,
  now()
)
ON CONFLICT (id) DO NOTHING;
`;
