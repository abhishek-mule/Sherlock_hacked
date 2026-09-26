/**
 * Shared record types.
 *
 * These used to live in `lib/supabase.ts` alongside a Supabase client. Supabase
 * was removed when the project became local-first, and keeping the client
 * around meant `createClient("", "")` threw at module load — which crashed every
 * page that transitively imported it. The types belong in their own module.
 */

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

  // Optional fields carried through from the workbooks
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

  // Populated from the OSINT / admission sheets when a match exists
  github_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  branch?: string;
  city?: string;
  skills?: string;
  location?: string;
}
