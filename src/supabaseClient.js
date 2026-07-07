import { createClient } from "@supabase/supabase-js";

// These come from Vercel environment variables (and .env locally).
// The anon key is safe to expose in the browser — Row Level Security on the
// waitlist table is what actually protects your data.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Set them in Vercel (Project Settings → Environment Variables) and in .env locally."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
