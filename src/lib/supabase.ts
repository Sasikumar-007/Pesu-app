import { createClient } from '@supabase/supabase-js';

// Use env vars with real fallbacks to ensure the deployed app always connects correctly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://maynrffyeyyklaxyliuo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heW5yZmZ5ZXl5a2xheHlsaXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTI1NjgsImV4cCI6MjA4NzY4ODU2OH0.ml2fp3X_waF4SNHf-ERXYP3CZxD8S0yHPtMXfen_he8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
