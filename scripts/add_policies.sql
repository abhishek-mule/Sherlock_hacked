-- Add policies one at a time
-- This script can be run separately after creating the table

-- Add read policy (will fail if it already exists)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Allow public read access to admission_data" 
      ON public.admission_data
      FOR SELECT 
      USING (true);
  EXCEPTION 
    WHEN duplicate_object THEN
      RAISE NOTICE 'Policy "Allow public read access to admission_data" already exists, skipping.';
  END;
END $$;

-- Add insert policy (will fail if it already exists)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Allow authenticated users to insert data"
      ON public.admission_data
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  EXCEPTION 
    WHEN duplicate_object THEN
      RAISE NOTICE 'Policy "Allow authenticated users to insert data" already exists, skipping.';
  END;
END $$; 