"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function CheckEnvPage() {
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKeyLength, setSupabaseKeyLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvInfo = async () => {
      try {
        setLoading(true);
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setSupabaseUrl(url || 'Not set');
        setSupabaseKeyLength(key ? key.length : 0);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvInfo();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Check</h1>
      
      {loading ? (
        <p>Loading environment information...</p>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Supabase Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl}</p>
              <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY Length:</strong> {supabaseKeyLength} characters</p>
              <p><strong>Is Setup Complete:</strong> {supabaseUrl && supabaseKeyLength > 0 ? 'Yes ✅' : 'No ❌'}</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Troubleshooting</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure your .env.local file contains the Supabase URL and anon key</li>
                <li>Check that your Supabase project is active and accessible</li>
                <li>Verify that the admission_data table exists in your Supabase database</li>
                <li>Restart the development server after making changes to environment variables</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 