import {createClient} from '@supabase/supabase-js';

// Access the environment variables with the correct VITE_ prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;


// Create a Supabase client with the updated variables
export const supabase = createClient(supabaseUrl, supabaseKey);
