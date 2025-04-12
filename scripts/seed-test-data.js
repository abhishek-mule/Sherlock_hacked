/*
 * This script adds test data to the student_data table in Supabase
 * Run with: node scripts/seed-test-data.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thpajmudzyytnpcbzbru.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocGFqbXVkenl5dG5wY2J6YnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDExMzYsImV4cCI6MjA2MDAxNzEzNn0.B6qtIN-DBQVXd-aFIKmzOrgnQM3w1_vQMF2HToBwZ_k';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  process.exit(1);
}

console.log(`Seeding test data to: ${supabaseUrl}`);
console.log('Credentials loaded successfully');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read the SQL migration file
const migrationPath = path.join(__dirname, '../migrations/create_student_data_table.sql');
let sqlScript;

try {
  if (fs.existsSync(migrationPath)) {
    sqlScript = fs.readFileSync(migrationPath, 'utf8');
    console.log('Migration file found and loaded');
  } else {
    console.log('Migration file not found. Will use inline SQL script...');
    sqlScript = `
      CREATE TABLE IF NOT EXISTS public.student_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "NAME" TEXT,
        "FIRSTNAME" TEXT,
        "LAST NAME" TEXT,
        "EMAILID" TEXT,
        "FATHERNAME" TEXT,
        "FATHER'S OCCUPATION" TEXT,
        "CATEGORY" TEXT,
        "RELIGION" TEXT,
        "SUB_CASTE" TEXT,
        "ROLLNO" TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
  }
} catch (error) {
  console.error('Error reading migration file:', error);
  process.exit(1);
}

// Direct SQL execution without RPC
async function executeSQL(sql) {
  try {
    // Use REST API to execute SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('SQL execution error:', error);
    return { success: false, error };
  }
}

async function seedData() {
  try {
    // Try to directly create the table without using RPC
    console.log('Creating student_data table directly...');
    
    // First try to check if the table exists
    const { data, error: queryError } = await supabase
      .from('student_data')
      .select('count(*)', { count: 'exact', head: true });
    
    if (queryError) {
      console.log('Table may not exist, attempting to create it...');
      
      // Direct SQL approach using REST API
      try {
        // Perform a raw query to create the table without RPC
        const insertData = getTestData();
        
        // If table doesn't exist, let's explicitly create it
        for (const student of insertData) {
          const { data, error } = await supabase
            .from('student_data')
            .insert([student])
            .select();
            
          if (error) {
            if (error.code === '42P01') { // Table doesn't exist
              console.error('Table does not exist. Please create it in the Supabase UI first.');
              console.log('Required schema:');
              console.log(`
                id: UUID (primary key)
                NAME: text
                FIRSTNAME: text
                LAST NAME: text
                EMAILID: text
                FATHERNAME: text
                FATHER'S OCCUPATION: text
                CATEGORY: text
                RELIGION: text
                SUB_CASTE: text
                ROLLNO: text
                created_at: timestamptz (default: now())
              `);
              break;
            } else {
              console.error('Error inserting data:', error);
            }
          } else {
            console.log(`Successfully inserted record for ${student.name} ${student.surname}`);
          }
        }
      } catch (directError) {
        console.error('Error creating table directly:', directError);
      }
    } else {
      // Table exists, check if it has data
      const count = data?.[0]?.count || 0;
      
      if (count === 0) {
        console.log('No existing data found. Inserting test data...');
        await insertTestData();
      } else {
        console.log(`Found existing data (${count} records). Skipping test data insertion.`);
      }
    }
    
    console.log('Seeding completed!');
    
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

async function insertTestData() {
  try {
    const testData = getTestData();
    const { data, error } = await supabase
      .from('student_data')
      .insert(testData);
    
    if (error) {
      console.error('Error inserting test data:', error);
      return;
    }
    
    console.log(`Successfully inserted ${testData.length} test records`);
  } catch (error) {
    console.error('Error in insertTestData:', error);
  }
}

function getTestData() {
  return [
    {
      NAME: 'John',
      FIRSTNAME: 'John',
      'LAST NAME': 'Doe',
      EMAILID: 'john.doe@example.com',
      FATHERNAME: 'James Doe',
      "FATHER'S OCCUPATION": 'Engineer',
      CATEGORY: 'General',
      RELIGION: 'Christianity',
      'SUB_CASTE': 'N/A',
      ROLLNO: 1001
    },
    {
      NAME: 'Jane',
      FIRSTNAME: 'Jane',
      'LAST NAME': 'Smith',
      EMAILID: 'jane.smith@example.com',
      FATHERNAME: 'Robert Smith',
      "FATHER'S OCCUPATION": 'Doctor',
      CATEGORY: 'General',
      RELIGION: 'Christianity',
      'SUB_CASTE': 'N/A',
      ROLLNO: 1002
    },
    {
      NAME: 'Raj',
      FIRSTNAME: 'Raj',
      'LAST NAME': 'Patel',
      EMAILID: 'raj.patel@example.com',
      FATHERNAME: 'Vikram Patel',
      "FATHER'S OCCUPATION": 'Business',
      CATEGORY: 'OBC',
      RELIGION: 'Hinduism',
      'SUB_CASTE': 'Patel',
      ROLLNO: 1003
    },
    {
      NAME: 'Priya',
      FIRSTNAME: 'Priya',
      'LAST NAME': 'Sharma',
      EMAILID: 'priya.sharma@example.com',
      FATHERNAME: 'Ajay Sharma',
      "FATHER'S OCCUPATION": 'Teacher',
      CATEGORY: 'General',
      RELIGION: 'Hinduism',
      'SUB_CASTE': 'Brahmin',
      ROLLNO: 1004
    },
    {
      NAME: 'Mohammed',
      FIRSTNAME: 'Mohammed',
      'LAST NAME': 'Khan',
      EMAILID: 'mohammed.khan@example.com',
      FATHERNAME: 'Abdul Khan',
      "FATHER'S OCCUPATION": 'Professor',
      CATEGORY: 'General',
      RELIGION: 'Islam',
      'SUB_CASTE': 'N/A',
      ROLLNO: 1005
    },
    {
      NAME: 'Robert',
      FIRSTNAME: 'Robert',
      'LAST NAME': 'Johnson',
      EMAILID: 'robert.j@example.com',
      FATHERNAME: 'William Johnson',
      "FATHER'S OCCUPATION": 'Lawyer',
      CATEGORY: 'General',
      RELIGION: 'Christianity',
      'SUB_CASTE': 'N/A',
      ROLLNO: 1006
    },
    {
      NAME: 'Sameera',
      FIRSTNAME: 'Sameera',
      'LAST NAME': 'Patel',
      EMAILID: 'sameera.p@example.com',
      FATHERNAME: 'Rajan Patel',
      "FATHER'S OCCUPATION": 'Accountant',
      CATEGORY: 'OBC',
      RELIGION: 'Hinduism',
      'SUB_CASTE': 'Patel',
      ROLLNO: 1007
    }
  ];
}

// Run the seeding process
seedData()
  .then(() => {
    console.log('Script execution completed.');
  })
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  }); 