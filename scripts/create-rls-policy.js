require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thpajmudzyytnpcbzbru.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocGFqbXVkenl5dG5wY2J6YnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDExMzYsImV4cCI6MjA2MDAxNzEzNn0.B6qtIN-DBQVXd-aFIKmzOrgnQM3w1_vQMF2HToBwZ_k';

console.log('Supabase URL:', supabaseUrl);
console.log('Using Supabase key:', supabaseKey ? 'Key is available' : 'No key found');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRLSPolicies() {
  console.log('Setting up RLS policies for student_data table...');

  try {
    // First check if the table exists
    const { data: tableData, error: tableError } = await supabase
      .from('student_data')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error checking student_data table:', tableError);
      return;
    }

    // Create SQL to handle RLS policies
    const createPoliciesSQL = `
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
      
      -- Insert a test record
      INSERT INTO student_data (
        "NAME", "FIRSTNAME", "LAST NAME", "EMAILID", "FATHERNAME", "FATHER'S OCCUPATION", "CATEGORY", "RELIGION", "SUB_CASTE"
      ) VALUES 
      ('Abhishek Kumar', 'Abhishek', 'Kumar', 'abhishek@example.com', 'Rajesh Kumar', 'Engineer', 'General', 'Hindu', 'N/A')
      ON CONFLICT DO NOTHING;
    `;
    
    // Execute the SQL
    const { error: sqlError } = await supabase.rpc('exec', { query: createPoliciesSQL });
    
    if (sqlError) {
      console.error('Error setting up RLS policies:', sqlError);
      
      // Try an alternative approach - create policies one by one
      console.log('Trying alternative approach...');
      
      // Try to create the SELECT policy
      const { error: selectError } = await supabase.rpc('exec', { 
        query: `CREATE POLICY "Allow public read access" ON student_data FOR SELECT USING (true);` 
      });
      
      if (selectError) {
        console.error('Error creating SELECT policy:', selectError);
      } else {
        console.log('Successfully created SELECT policy');
      }
      
      // Try to create the INSERT policy
      const { error: insertError } = await supabase.rpc('exec', { 
        query: `CREATE POLICY "Allow public insert access" ON student_data FOR INSERT WITH CHECK (true);` 
      });
      
      if (insertError) {
        console.error('Error creating INSERT policy:', insertError);
      } else {
        console.log('Successfully created INSERT policy');
      }
    } else {
      console.log('Successfully set up all RLS policies!');
    }

    // Check if policies are working by trying to insert data
    const { data: insertData, error: insertError } = await supabase
      .from('student_data')
      .insert([
        {
          NAME: 'Test Student',
          FIRSTNAME: 'Test',
          'LAST NAME': 'Student',
          EMAILID: 'test@example.com',
          FATHERNAME: 'Test Father',
          'FATHER\'S OCCUPATION': 'Test Occupation',
          CATEGORY: 'General',
          RELIGION: 'Test',
          SUB_CASTE: 'Test'
        }
      ]);
    
    if (insertError) {
      console.error('Error inserting test data after policy setup:', insertError);
    } else {
      console.log('Successfully inserted test data!');
    }

    // Verify that policies are working by checking data
    const { data: verifyData, error: verifyError } = await supabase
      .from('student_data')
      .select('*')
      .limit(10);
    
    if (verifyError) {
      console.error('Error verifying data:', verifyError);
    } else {
      console.log(`Found ${verifyData.length} records in student_data table:`, verifyData);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
createRLSPolicies()
  .then(() => {
    console.log('RLS policy setup completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('RLS policy setup failed:', err);
    process.exit(1);
  }); 