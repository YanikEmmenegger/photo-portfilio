import { createClient } from '@supabase/supabase-js';

// Replace with your own Supabase URL and anon key
const supabaseUrl = 'https://rlrwzexcwltozehpxzmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscnd6ZXhjd2x0b3plaHB4em10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMxMTQ0NjIsImV4cCI6MjAzODY5MDQ2Mn0.I_3mJNZ6LwL0kjrzaP-DEo3G0mDUPD0ImV-IVofDXUs';

export const supabase = createClient(supabaseUrl, supabaseKey);
