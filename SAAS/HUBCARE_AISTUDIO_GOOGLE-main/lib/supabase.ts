
import { createClient } from '@supabase/supabase-js';

/**
 * The Supabase SDK throws a runtime error if the URL is an empty string.
 * We provide placeholder defaults to ensure the module can be imported without crashing the entire app.
 * If the actual environment variables are missing, the database operations will fail gracefully 
 * with a 401/404 error caught in the components' try-catch blocks.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
