import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function SetupGuidePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admission Data Setup Guide</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Setup Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">It appears that there was an issue connecting to your admission_data table. This could be because:</p>
          
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>The table doesn&apos;t exist in your Supabase database</li>
            <li>The Supabase connection details are incorrect</li>
            <li>There&apos;s an issue with permissions or policies</li>
          </ul>
          
          <p className="font-medium mt-6">Follow these steps to resolve the issue:</p>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Verify Supabase Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p className="font-medium">Check your Supabase project</p>
                <p className="text-sm text-muted-foreground">Log in to your Supabase dashboard at <a href="https://app.supabase.com" className="text-blue-600 hover:underline">https://app.supabase.com</a> and verify your project is active.</p>
              </li>
              <li>
                <p className="font-medium">Verify environment variables</p>
                <p className="text-sm text-muted-foreground">Make sure your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file contains the correct Supabase URL and anon key.</p>
                <div className="bg-muted p-3 rounded-md mt-2 text-sm font-mono">
                  <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co</p>
                  <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Create the admission_data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p className="font-medium">Navigate to the SQL Editor in Supabase</p>
                <p className="text-sm text-muted-foreground">In your Supabase dashboard, click on &quot;SQL Editor&quot; in the left sidebar.</p>
              </li>
              <li>
                <p className="font-medium">Run the table creation SQL script</p>
                <p className="text-sm text-muted-foreground">Copy the SQL below and run it in the SQL Editor:</p>
                <div className="bg-muted p-3 rounded-md mt-2 text-sm font-mono overflow-auto max-h-80">
                  <pre>{`-- Create admission_data table if it doesn't exist
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
  USING (true);`}</pre>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Import Your Admission Data</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <p className="font-medium">Prepare your CSV file</p>
                <p className="text-sm text-muted-foreground">Make sure your CSV file has the appropriate column headers that match the table structure.</p>
              </li>
              <li>
                <p className="font-medium">Import using the Supabase Table Editor</p>
                <p className="text-sm text-muted-foreground">In your Supabase dashboard, go to the &quot;Table Editor&quot;, select the admission_data table, and click &quot;Import Data&quot;.</p>
              </li>
              <li>
                <p className="font-medium">Alternatively, use the Node.js import script</p>
                <p className="text-sm text-muted-foreground">Run <code className="bg-muted px-1 py-0.5 rounded">node scripts/import-admission-data.js</code> from your project directory.</p>
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Restart Your Application</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">After completing the above steps:</p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Stop your Next.js development server (press Ctrl+C)</li>
              <li>Start it again with <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code></li>
              <li>Navigate to the admission data search page</li>
            </ol>
            
            <p className="mt-4 text-sm text-muted-foreground">If you continue to experience issues, check the browser console and server logs for specific error messages.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 