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
  // Academic Records
  tenth_marks_obtained?: string | number;
  tenth_out_of_marks?: string | number;
  twelfth_marks_obtained?: string | number;
  twelfth_out_of_marks?: string | number;
  diploma_marks_obtained?: string | number;
  entrance_exam_percentage?: string | number;
  // Contact Information
  address_permanant?: string;
  city_village_permanant?: string;
  district_permanant?: string;
  state_permanant?: string;
  address_local?: string;
  pin_local?: string;
  // Other Details
  physically_handicapped?: string | boolean;
  height?: string | number;
  weight?: string | number;
  bank_name?: string;
  ifsccode?: string;
  sport_name?: string;
  // URLs
  image_url: string | {
    seed: string;
    gender: string;
  };
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  
  // Extended fields from full DB query
  // These fields allow the Student interface to accept any additional properties from the database
  [key: string]: any;
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