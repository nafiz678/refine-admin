import { createClient } from '@refinedev/supabase';
import { Database } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseRole = import.meta.env.VITE_SUPABASE_SECRET_SERVICE_ROLE;

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, supabaseRole);
export const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);