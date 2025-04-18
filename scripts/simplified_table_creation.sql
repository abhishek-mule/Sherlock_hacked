-- Create admission_data table for storing admission information
CREATE TABLE IF NOT EXISTS public.admission_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_no INTEGER,
  merit_no INTEGER,
  mht_cet_score DECIMAL,
  application_id TEXT UNIQUE,
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

-- Grant access to authenticated users
ALTER TABLE public.admission_data ENABLE ROW LEVEL SECURITY;

-- Comment on table and columns for documentation
COMMENT ON TABLE public.admission_data IS 'Stores student admission data imported from CSV files';
COMMENT ON COLUMN public.admission_data.application_id IS 'Unique identifier for each student application';
COMMENT ON COLUMN public.admission_data.mht_cet_score IS 'MHT-CET exam score';
COMMENT ON COLUMN public.admission_data.seat_type IS 'Type of seat allotted to the student';
COMMENT ON COLUMN public.admission_data.branch IS 'Engineering branch/specialization'; 