-- Create student_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.student_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT,
  email TEXT,
  father_name TEXT,
  occupation TEXT,
  category TEXT,
  religion TEXT,
  subcast TEXT,
  rollno TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_data ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
CREATE POLICY "Allow select for all users" 
  ON public.student_data 
  FOR SELECT 
  USING (true);

-- Grant insert/update for authenticated users
CREATE POLICY "Allow insert for authenticated users" 
  ON public.student_data 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users" 
  ON public.student_data 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS idx_student_data_name ON public.student_data (name);
CREATE INDEX IF NOT EXISTS idx_student_data_surname ON public.student_data (surname);
CREATE INDEX IF NOT EXISTS idx_student_data_rollno ON public.student_data (rollno); 