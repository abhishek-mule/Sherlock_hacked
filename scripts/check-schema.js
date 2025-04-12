/*
 * This script checks the schema of the student_data table in Supabase
 * Run with: node scripts/check-schema.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use fallback values if environment variables aren't available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thpajmudzyytnpcbzbru.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocGFqbXVkenl5dG5wY2J6YnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDExMzYsImV4cCI6MjA2MDAxNzEzNn0.B6qtIN-DBQVXd-aFIKmzOrgnQM3w1_vQMF2HToBwZ_k';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  try {
    console.log('Checking student_data table schema...');
    
    // First, check if the table exists by fetching a sample row
    const { data, error } = await supabase
      .from('student_data')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Table exists. Column names from sample row:');
      const sampleRow = data[0];
      const columns = Object.keys(sampleRow);
      
      columns.forEach((column, index) => {
        console.log(`${index + 1}. ${column} (sample value: ${JSON.stringify(sampleRow[column])})`);
      });
      
      console.log('\nTotal columns found:', columns.length);
    } else {
      console.log('Table exists but no data found.');
      
      // Try to fetch metadata about the table
      console.log('\nAttempting to fetch all data to infer schema...');
      const { data: allData, error: allError } = await supabase
        .from('student_data')
        .select('*');
      
      if (allError) {
        console.error('Error fetching all data:', allError);
      } else if (allData && allData.length > 0) {
        console.log(`Found ${allData.length} rows.`);
        console.log('Columns from first row:');
        const columns = Object.keys(allData[0]);
        columns.forEach(col => console.log(` - ${col}`));
      } else {
        console.log('No data available to infer schema.');
      }
    }
    
    // Try a simpler approach to insert a test record
    console.log('\nTrying to insert a minimal test record to identify required columns...');
    
    const testRecord = {
      // Start with minimal fields
      NAME: 'Test User',
      SRNO: 'TEST001'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('student_data')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.error('Insert test failed:', insertError);
      
      // Try with lowercase field names
      console.log('\nAttempting with lowercase field names...');
      const lowercaseTest = {
        name: 'Test User Lowercase',
        srno: 'TEST002'
      };
      
      const { data: lcResult, error: lcError } = await supabase
        .from('student_data')
        .insert([lowercaseTest])
        .select();
      
      if (lcError) {
        console.error('Lowercase insert test failed:', lcError);
      } else {
        console.log('Lowercase insert succeeded!', lcResult);
      }
    } else {
      console.log('Insert test succeeded!', insertResult);
    }
    
  } catch (error) {
    console.error('Unexpected error checking schema:', error);
  }
}

// Run the check
checkSchema()
  .then(() => {
    console.log('Schema check completed.');
  })
  .catch(error => {
    console.error('Script execution failed:', error);
  }); 