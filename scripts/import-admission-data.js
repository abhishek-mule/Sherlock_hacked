/*
 * This script imports admission data from CSV file to the Supabase database
 * Run with: node scripts/import-admission-data.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thpajmudzyytnpcbzbru.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocGFqbXVkenl5dG5wY2J6YnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDExMzYsImV4cCI6MjA2MDAxNzEzNn0.B6qtIN-DBQVXd-aFIKmzOrgnQM3w1_vQMF2HToBwZ_k';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  process.exit(1);
}

console.log(`Importing admission data to: ${supabaseUrl}`);
console.log('Credentials loaded successfully');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Path to the CSV file
const csvFilePath = path.join(__dirname, '../app/admission.csv');

// Function to check if admission_data table exists
async function checkTableExists() {
  try {
    // Try a simple query to check if table exists
    const { data, error } = await supabase
      .from('admission_data')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log(`
=======================================================================
ERROR: The 'admission_data' table does not exist in your Supabase database.

Please create the table manually in the Supabase dashboard:
1. Go to your Supabase project dashboard
2. Go to "Table Editor" > "New Table"
3. Create a table named "admission_data" with the following columns:

   id: UUID (primary key, default gen_random_uuid())
   sr_no: INTEGER
   merit_no: INTEGER
   mht_cet_score: DECIMAL
   application_id: TEXT UNIQUE
   full_name: TEXT
   gender: TEXT
   category: TEXT
   seat_type: TEXT
   branch: TEXT
   college: TEXT
   city: TEXT
   seat_level: TEXT
   status: TEXT
   admitted: TEXT
   created_at: TIMESTAMPTZ (default now())

4. Add an index on application_id for faster lookups:
   Under "Indexes" > "Create new index":
   Name: idx_admission_data_application_id
   Column: application_id

5. Run this script again after creating the table
=======================================================================
        `);
        return false;
      }
      console.error('Error checking if table exists:', error);
      return false;
    }
    
    // Table exists
    console.log(`Admission data table exists with ${data[0].count} records`);
    return true;
  } catch (error) {
    console.error('Error in checkTableExists:', error);
    return false;
  }
}

// Function to read and process CSV data
async function importAdmissionData() {
  try {
    // First ensure the table exists
    const tableExists = await checkTableExists();
    if (!tableExists) {
      console.error('Admission data table does not exist. Please create it first in Supabase dashboard.');
      return;
    }
    
    // Array to store all rows from CSV
    const admissionData = [];
    
    console.log(`Reading CSV file from: ${csvFilePath}`);
    
    // Read and parse the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to database fields
          const formattedRow = {
            sr_no: parseInt(row['Sr No']) || null,
            merit_no: parseInt(row['Merit No']) || null,
            mht_cet_score: parseFloat(row['MHT-CET Score']) || null,
            application_id: row['Application ID'],
            full_name: row['Full Name'],
            gender: row['Gender'],
            category: row['Category'],
            seat_type: row['Seat Type'],
            branch: row['Branch'],
            college: row['College'],
            city: row['City'],
            seat_level: row['Seat Level'],
            status: row['Status'],
            admitted: row['Admitted']
          };
          
          admissionData.push(formattedRow);
        })
        .on('end', () => {
          console.log(`Successfully read ${admissionData.length} records from CSV`);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    // Check if we have data to import
    if (admissionData.length === 0) {
      console.log('No data found in CSV file. Nothing to import.');
      return;
    }
    
    // Process data in batches to avoid hitting API limits
    const batchSize = 100;
    const totalBatches = Math.ceil(admissionData.length / batchSize);
    
    console.log(`Processing ${admissionData.length} records in ${totalBatches} batches...`);
    
    // Import data in batches
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, admissionData.length);
      const batch = admissionData.slice(start, end);
      
      console.log(`Importing batch ${i + 1}/${totalBatches} (rows ${start + 1}-${end})...`);
      
      // First, check for existing application IDs to avoid duplicates
      const applicationIds = batch.map(record => record.application_id);
      
      const { data: existingRecords, error: checkError } = await supabase
        .from('admission_data')
        .select('application_id')
        .in('application_id', applicationIds);
      
      if (checkError) {
        console.error(`Error checking for existing records in batch ${i + 1}:`, checkError);
        continue;
      }
      
      // Filter out records that already exist in the database
      const existingIds = existingRecords ? existingRecords.map(record => record.application_id) : [];
      const newRecords = batch.filter(record => !existingIds.includes(record.application_id));
      
      if (newRecords.length === 0) {
        console.log(`All records in batch ${i + 1} already exist. Skipping.`);
        continue;
      }
      
      console.log(`Inserting ${newRecords.length} new records (skipping ${batch.length - newRecords.length} duplicates)...`);
      
      // Insert new records
      const { data, error } = await supabase
        .from('admission_data')
        .insert(newRecords);
      
      if (error) {
        console.error(`Error importing batch ${i + 1}:`, error);
      } else {
        console.log(`Successfully imported batch ${i + 1} (${newRecords.length} records)`);
      }
    }
    
    console.log('Admission data import completed!');
    
  } catch (error) {
    console.error('Error importing admission data:', error);
  }
}

// Run the import process
importAdmissionData()
  .then(() => {
    console.log('Script execution completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  }); 