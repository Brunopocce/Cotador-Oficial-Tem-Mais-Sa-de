
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas
const SUPABASE_URL = 'https://ejpxgueojdfmcwspkcmg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcHhndWVvamRmbWN3c3BrY21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDc1MTUsImV4cCI6MjA3OTc4MzUxNX0.z9xozcPhPEFi7btSawm3zwO0YK1RDWaDKoI1yssc0mI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
