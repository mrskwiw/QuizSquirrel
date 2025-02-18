import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvrfibhhrommjxjdbcem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cmZpYmhocm9tbWp4amRiY2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NzQ4OTMsImV4cCI6MjA1NDQ1MDg5M30.F1b8psmWiBZTq5tPObYJg2WtzfN-rd8ZKg9GWj7KtoQ';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Set the site URL to the Supabase project URL
    site: supabaseUrl
  }
});
