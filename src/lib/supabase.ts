import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pqsceqtljxpzthmerkyc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxc2NlcXRsanhwenRobWVya3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MzIyODksImV4cCI6MjA4NzUwODI4OX0.OqEiwW67sLBLJ2uw0AmsXubiZRSKcC9I91dFkNbOXHU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
