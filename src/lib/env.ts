// src/lib/env.ts

export function getSupabaseUrl(): string {
  // Must be written out explicitly so Next.js can find-and-replace it
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!url) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!key) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  
  return key;
}