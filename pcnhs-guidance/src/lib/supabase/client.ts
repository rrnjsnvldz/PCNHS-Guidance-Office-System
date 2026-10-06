import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wcdmkalavrqrppvzxapu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZG1rYWxhdnJxcnBwdnp4YXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNTE5NTksImV4cCI6MjEwNjgyNzk1OX0.EIYFOl7Es-Niqet0Nj5cjGnSR_an7Xs7LC8iW3pnQ0A';

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}
