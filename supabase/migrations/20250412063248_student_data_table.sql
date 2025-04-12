/*
  # Create student_data table with social links

  1. New Tables (if not exists)
    - `student_data`
      - `id` (uuid, primary key)
      - `name` (text)
      - `surname` (text)
      - `email` (text)
      - `father_name` (text)
      - `occupation` (text)
      - `category` (text)
      - `religion` (text)
      - `subcast` (text)
      - `image_url` (text)
      - `github_url` (text)
      - `twitter_url` (text)
      - `linkedin_url` (text)
      - `instagram_url` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `student_data` table
    - Add policy for authenticated users to read student data
*/

-- Drop the table if it exists to avoid conflicts
DROP TABLE IF EXISTS student_data;

-- Create the student_data table with the exact column names from your schema
CREATE TABLE student_data (
   id serial PRIMARY KEY,
  srno text,
  registration_no text,
  enrollment_number text,
  abc_id_number text,
  rollno text,
  admission_type text,
  name text,
  firstname text,
  middle_name text,
  last_name text,
  mobile_no text,
  student_mobile_no_2 text,
  student_alternate_mobile_no text,
  emailid text,
  alternate_email_id text,
  dob date,
  birth_place text,
  gender text,
  nationality text,
  blood_group text,
  marital_status text,
  religion text,
  category text,
  sub_caste text,
  physically_handicapped text,
  type_of_disability text,
  adhaar_no text,
  passport_no text,
  admission_through text,
  hosteller text,
  transportation text,
  is_parents_alive text,
  fathername text,
  fathermiddlename text,
  fatherlastname text,
  fathermobile text,
  fathers_alternate_mobile_no text,
  fathers_office_phone_no text,
  fathers_qualification text,
  fathers_occupation text,
  father_email text,
  annual_family_income numeric,
  mothername text,
  mothermobile text,
  mothers_alternate_mobile_no text,
  mothers_qualification text,
  mothers_occupation text,
  mother_email text,
  mothers_office_phone_no text,
  social_category text,
  address_permanant text,
  city_village_permanant text,
  taluka_permanent text,
  district_permanant text,
  state_permanant text,
  landline_no text,
  area_post_office text,
  area_police_station text,
  pin_per text,
  address_local text,
  city_village_local text,
  taluka_local text,
  district_local text,
  state_local text,
  landline_no_local text,
  area_post_office_local text,
  area_police_station_local text,
  pin_local text,
  guardian_name text,
  guardian_contact_no text,
  relation_with_guardian text,
  guardian_occupation text,
  guardian_qualification text,
  admission_date date,
  admission_type1 text,
  program_level text,
  admission_category text,
  school_college text,
  degree text,
  programme_branch text,
  medium_of_instruction text,
  admission_batch text,
  year integer,
  semester integer,
  academic_year text,
  uploaded_documents text,
  tenth_school_college_name text,
  tenth_board text,
  tenth_year_of_exam integer,
  tenth_medium text,
  tenth_marks_obtained numeric,
  tenth_out_of_marks numeric,
  tenth_percentile numeric,
  seat_no text,
  school_college_address text,
  twelfth_school_college_name text,
  twelfth_board text,
  twelfth_year_of_exam integer,
  twelfth_medium text,
  twelfth_seat_no text,
  phy_obt_marks numeric,
  phy_total_marks numeric,
  che_obt_marks numeric,
  che_total_marks numeric,
  math_obt_marks numeric,
  math_total_marks numeric,
  pcm_obt_marks numeric,
  pcm_percentage numeric,
  vocational_subject text,
  voc_obtained_marks numeric,
  voc_total_marks numeric,
  twelfth_marks_obtained numeric,
  twelfth_out_of_marks numeric,
  twelfth_percentile numeric,
  twelfth_school_college_address text,
  diploma_school_college_name text,
  diploma_board text,
  diploma_year_of_exam integer,
  diploma_medium text,
  diploma_marks_obtained numeric,
  diploma_out_of_marks numeric,
  diploma_percentile numeric,
  diploma_seat_no text,
  diploma_school_college_address text,
  entrance_exam text,
  entrance_exam_seat_no text,
  year_of_exam integer,
  percentile_extrance_exam numeric,
  rank numeric,
  last_qualification text,
  last_qualification_school_college_name text,
  last_qualification_board text,
  last_qualification_qualifying_exam text,
  last_qualification_seat_no text,
  last_qualification_year_of_exam integer,
  last_qualification_mark_obtained numeric,
  last_qualification_out_of_marks numeric,
  last_qualification_percentage numeric,
  last_qualification_grade text,
  last_qualification_dgpa_cgpa numeric,
  last_qualification_college_address text,
  phd_school_college_name text,
  phd_board text,
  phd_qualifying_exam text,
  phd_year_of_exam integer,
  phd_seat_no text,
  phd_marks_obtained numeric,
  phd_out_of_marks numeric,
  phd_percentage numeric,
  phd_grade text,
  phd_school_college_address text,
  are_you_vaccinated_yes_or_no text,
  vaccine_name text,
  firstdose_vaccination_center text,
  seconddose_vaccination_center text,
  firstdose_vaccinated_date date,
  seconddose_vaccinated_date date,
  mtongue text,
  other_language text,
  identi_mark text,
  height numeric,
  weight numeric,
  bank_name text,
  ifsccode text,
  bankaddress text,
  sport_name text,
  sport_level text,
  achievement_details text,
  information_verified text,
  payment_type text,
  admitted_status text,
  admission_status text,
  integrated_application_id text,
  entrance_exam_name text,
  entrance_exam_seat_number text,
  entrance_exam_year integer,
  entrance_exam_percentage numeric
);

-- Add Row Level Security
ALTER TABLE student_data ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all users to read data
CREATE POLICY "Allow public read access" 
ON student_data 
FOR SELECT 
USING (true);

-- Insert test data that will match your search
INSERT INTO student_data (
  NAME, FIRSTNAME, "LAST NAME", EMAILID, FATHERNAME, "FATHER'S OCCUPATION", CATEGORY, RELIGION, SUB_CASTE
) VALUES 
('Abhishek Kumar', 'Abhishek', 'Kumar', 'abhishek@example.com', 'Rajesh Kumar', 'Engineer', 'General', 'Hindu', 'N/A'),
('John Smith', 'John', 'Smith', 'john@example.com', 'Michael Smith', 'Doctor', 'General', 'Christian', 'N/A'),
('Priya Patel', 'Priya', 'Patel', 'priya@example.com', 'Suresh Patel', 'Business', 'OBC', 'Hindu', 'Patel'); 