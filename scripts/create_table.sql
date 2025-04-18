-- Create admission_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admission_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_no INTEGER,
  merit_no INTEGER,
  mht_cet_score DECIMAL,
  application_id TEXT,
  full_name TEXT,
  gender TEXT,
  category TEXT,
  seat_type TEXT,
  branch TEXT,
  college TEXT,
  city TEXT,
  seat_level TEXT,
  status TEXT,
  admitted TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admission_data_application_id ON public.admission_data(application_id);
CREATE INDEX IF NOT EXISTS idx_admission_data_full_name ON public.admission_data(full_name);
CREATE INDEX IF NOT EXISTS idx_admission_data_branch ON public.admission_data(branch);
CREATE INDEX IF NOT EXISTS idx_admission_data_college ON public.admission_data(college);

-- Grant access to all users
ALTER TABLE public.admission_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access to admission_data" ON public.admission_data;
CREATE POLICY "Allow public read access to admission_data" 
  ON public.admission_data
  FOR SELECT 
  USING (true);

-- Sample data insertion (uncomment if you want to add test data)
-- INSERT INTO public.admission_data (sr_no, merit_no, mht_cet_score, application_id, full_name, gender, category, seat_type, branch, college, city, status)
-- VALUES 
--   (1, 12345, 95.5, 'APP001', 'John Doe', 'Male', 'OPEN', 'Institute Level', 'Computer Engineering', 'ABC College', 'Mumbai', 'Confirmed'),
--   (2, 12346, 92.3, 'APP002', 'Jane Smith', 'Female', 'OPEN', 'CAP', 'Information Technology', 'XYZ Institute', 'Pune', 'Confirmed');

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'Table admission_data created or already exists';
END $$; 