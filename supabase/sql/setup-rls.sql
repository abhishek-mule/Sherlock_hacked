-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON student_data;
DROP POLICY IF EXISTS "Allow public insert access" ON student_data;
DROP POLICY IF EXISTS "Allow public update access" ON student_data;
DROP POLICY IF EXISTS "Allow public delete access" ON student_data;

-- Make sure RLS is enabled
ALTER TABLE student_data ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT (read)
CREATE POLICY "Allow public read access"
ON student_data
FOR SELECT
USING (true);

-- Create policy for INSERT
CREATE POLICY "Allow public insert access"
ON student_data
FOR INSERT
WITH CHECK (true);

-- Create policy for UPDATE
CREATE POLICY "Allow public update access"
ON student_data
FOR UPDATE
USING (true);

-- Create policy for DELETE
CREATE POLICY "Allow public delete access"
ON student_data
FOR DELETE
USING (true);

-- Insert test data if not already present
INSERT INTO student_data (
  "NAME", "FIRSTNAME", "LAST NAME", "EMAILID", "FATHERNAME", "FATHER'S OCCUPATION", "CATEGORY", "RELIGION", "SUB_CASTE"
) VALUES 
('Abhishek Kumar', 'Abhishek', 'Kumar', 'abhishek@example.com', 'Rajesh Kumar', 'Engineer', 'General', 'Hindu', 'N/A')
ON CONFLICT DO NOTHING;

-- Query existing data to verify
SELECT * FROM student_data LIMIT 10; 