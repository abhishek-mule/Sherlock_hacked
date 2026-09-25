import { createClient } from '@supabase/supabase-js';

export interface Student {
  id: string;
  name: string;
  surname: string;
  email: string;
  father_name: string;
  occupation: string;
  category: string;
  religion: string;
  subcast: string;
  // Additional fields from the schema
  rollno?: string;
  registrationNo?: string;
  enrollmentNumber?: string;
  admissionType?: string;
  mobileNo?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  socialCategory?: string;
  adhaarNo?: string;
  motherName?: string;
  motherOccupation?: string;
  annualFamilyIncome?: string;
  image_url: string;
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
}

// Supabase config — secrets must come from environment (see .env.example).
// The hardcoded fallback was removed (was leaking anon key). In development,
// set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY — set them in .env (see .env.example). Local SQLite is the primary DB.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);