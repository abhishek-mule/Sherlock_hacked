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

// Fallback values in case environment variables aren't available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thpajmudzyytnpcbzbru.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocGFqbXVkenl5dG5wY2J6YnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDExMzYsImV4cCI6MjA2MDAxNzEzNn0.B6qtIN-DBQVXd-aFIKmzOrgnQM3w1_vQMF2HToBwZ_k';

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