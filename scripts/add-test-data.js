require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with hardcoded values for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thpajmudzyytnpcbzbru.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocGFqbXVkenl5dG5wY2J6YnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDExMzYsImV4cCI6MjA2MDAxNzEzNn0.B6qtIN-DBQVXd-aFIKmzOrgnQM3w1_vQMF2HToBwZ_k';

console.log('Supabase URL:', supabaseUrl);
console.log('Using Supabase key:', supabaseKey ? 'Key is available' : 'No key found');

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestData() {
  console.log('Adding test data to student_data table...');

  try {
    // First, check if the table exists
    const { data: tableData, error: tableError } = await supabase
      .from('student_data')
      .select('*')
      .limit(1);

    if (tableError) {
      // If the table doesn't exist, try to create it
      console.log('Table error or does not exist. Creating it now...');
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS student_data (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "NAME" text,
          "FIRSTNAME" text,
          "LAST NAME" text,
          "EMAILID" text,
          "FATHERNAME" text,
          "FATHER'S OCCUPATION" text,
          "CATEGORY" text,
          "RELIGION" text,
          "SUB_CASTE" text,
          created_at timestamptz DEFAULT now()
        );
        
        -- Add Row Level Security
        ALTER TABLE student_data ENABLE ROW LEVEL SECURITY;
        
        -- Create a policy to allow all users to read data
        CREATE POLICY "Allow public read access" 
        ON student_data 
        FOR SELECT 
        USING (true);
      `;

      const { error: createError } = await supabase.rpc('exec', { query: createTableQuery });
      
      if (createError) {
        console.error('Error creating table:', createError);
        console.log('Trying alternative approach...');
      }
    }

    // Delete existing test data to avoid duplicates
    try {
      await supabase
        .from('student_data')
        .delete()
        .eq('EMAILID', 'abhishek@example.com');
      
      console.log('Deleted existing test data');
    } catch (deleteErr) {
      console.log('Error deleting or no data to delete:', deleteErr);
    }

    // Insert test data
    const { data, error } = await supabase
      .from('student_data')
      .insert([
        {
          NAME: 'Abhishek Kumar',
          FIRSTNAME: 'Abhishek',
          'LAST NAME': 'Kumar',
          EMAILID: 'abhishek@example.com',
          FATHERNAME: 'Rajesh Kumar',
          'FATHER\'S OCCUPATION': 'Engineer',
          CATEGORY: 'General',
          RELIGION: 'Hindu',
          SUB_CASTE: 'N/A'
        }
      ]);

    if (error) {
      console.error('Error inserting test data:', error);
      return;
    }

    console.log('Successfully added test data');
    
    // Verify data was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('student_data')
      .select('*')
      .eq('EMAILID', 'abhishek@example.com');
      
    if (verifyError) {
      console.error('Error verifying data:', verifyError);
    } else {
      console.log('Verification: ', verifyData);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
addTestData()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  }); 