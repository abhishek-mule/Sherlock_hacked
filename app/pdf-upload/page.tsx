'use client';

import { useState, useEffect } from 'react';
import { PDFUpload } from '@/components/pdf-upload';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, HelpCircle, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PDFUploadPage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check if the backend API is accessible
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:8001/health', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          // Add a timeout to avoid long waits
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        console.error('API check error:', error);
        setApiStatus('offline');
      }
    };
    
    checkApiStatus();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">PDF Student Data Extraction</h1>
      </div>
      
      {apiStatus === 'offline' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Backend API is offline. Please start the FastAPI server with:
            <code className="ml-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
              python pdf_extractor.py
            </code>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:order-1">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Student PDF</h2>
            <PDFUpload />
          </div>
        </div>
        
        <div className="md:order-2">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Structured Data Display
              </CardTitle>
              <CardDescription>
                After uploading, extracted student information will be displayed in a structured format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Smart Data Extraction</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system recognizes common student information patterns from your PDF.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Multiple Record Support</h3>
                    <p className="text-sm text-muted-foreground">
                      The system can identify and extract multiple student records from a single PDF.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Searchable Database</h3>
                    <p className="text-sm text-muted-foreground">
                      All extracted student records are saved and can be searched by name.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href="/search">
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Go to Student Search
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {apiStatus === 'offline' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">Backend Server Setup</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-amber-700">
                <li>Ensure Python and required packages are installed</li>
                <li>Install Tesseract OCR and Poppler (for PDF processing)</li>
                <li>Run <code className="px-1 py-0.5 bg-amber-100 rounded">python pdf_extractor.py</code> in your terminal</li>
                <li>The server should start at <code className="px-1 py-0.5 bg-amber-100 rounded">http://localhost:8001</code></li>
                <li>Refresh this page to check the connection status</li>
              </ol>
            </div>
          )}

          <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Troubleshooting
            </h3>
            <div className="text-sm text-blue-700 space-y-3">
              <p>If you&apos;re having trouble uploading PDFs, try these steps:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Port already in use:</strong> The server might be running on a different port.
                  <pre className="mt-1 px-2 py-1 bg-blue-100 rounded text-xs">netstat -ano | findstr :8001</pre>
                  If you see a process using port 8001, close it or use a different port in pdf_extractor.py.
                </li>
                <li>
                  <strong>Missing dependencies:</strong> Make sure all required packages are installed:
                  <pre className="mt-1 px-2 py-1 bg-blue-100 rounded text-xs">pip install fastapi uvicorn python-multipart pillow pytesseract pymupdf</pre>
                </li>
                <li>
                  <strong>PDF processing issues:</strong> Ensure Tesseract OCR is properly installed. The system now uses PyMuPDF which doesn't require Poppler.
                </li>
                <li>
                  <strong>Check server logs:</strong> Look at the terminal where you started the server for error messages.
                </li>
                <li>
                  <strong>Restart the server:</strong> Sometimes stopping and restarting the server can resolve issues.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 