import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const cookieStore = cookies();
  
  return supabaseCreateClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: {
        getItem: (name: string) => {
          const cookie = cookieStore.get(name);
          return cookie?.value || null;
        },
        setItem: () => {},
        removeItem: () => {},
      },
    },
  });
}; 