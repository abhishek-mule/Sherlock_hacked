import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, User, Phone, Calendar, School, Mail, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StudentData {
  name?: string;
  student_id?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  course?: string;
  address?: string;
  category?: string;
  father_name?: string;
  mother_name?: string;
  source_file?: string;
  extraction_time?: string;
  [key: string]: any;
}

export function PDFUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [extractedStudents, setExtractedStudents] = useState<StudentData[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setError(null);
    setSuccess(null);
    setDebugInfo(null);
    setExtractedStudents([]);
    
    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      toast({
        title: 'Error',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setDebugInfo(`Starting upload of ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      setDebugInfo(prev => `${prev}\nSending to API at http://localhost:8001/extract-student-data/`);

      // Send to backend API with longer timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      try {
        const response = await fetch('http://localhost:8001/extract-student-data/', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setDebugInfo(prev => `${prev}\nReceived response with status: ${response.status}`);

        let result;
        const responseText = await response.text();
        setDebugInfo(prev => `${prev}\nResponse text: ${responseText.substring(0, 150)}${responseText.length > 150 ? '...' : ''}`);
        
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Failed to parse server response: ${responseText.substring(0, 100)}`);
        }

        if (!response.ok) {
          throw new Error(result?.detail || `Server error: ${response.status}`);
        }
        
        // Display success message
        const successMessage = `${result.message || 'PDF processed successfully'}`;
        setSuccess(successMessage);
        toast({
          title: 'Success',
          description: successMessage,
        });

        // Store extracted students
        if (result.students && Array.isArray(result.students) && result.students.length > 0) {
          setExtractedStudents(result.students);
        } else if (result.student_data) {
          // For backward compatibility with older API versions
          setExtractedStudents([result.student_data]);
        }

        // Log the result
        console.log('PDF processing result:', result);
        
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 60 seconds. The server may be busy or not responding.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStudentCard = (student: StudentData, index: number) => {
    // Get all keys from student object excluding some metadata fields
    const excludeFields = ['source_file', 'extraction_time', '__typename'];
    const fields = Object.keys(student).filter(key => !excludeFields.includes(key));

    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle>{student.name || 'Unnamed Student'}</CardTitle>
          <CardDescription>
            {student.student_id ? `ID: ${student.student_id}` : 'No ID available'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {student.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
            )}
            
            {student.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
            )}
            
            {student.dob && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>DOB: {student.dob}</span>
              </div>
            )}
            
            {student.gender && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Gender: {student.gender}</span>
              </div>
            )}
            
            {student.course && (
              <div className="flex items-center space-x-2">
                <School className="h-4 w-4 text-muted-foreground" />
                <span>Course: {student.course}</span>
              </div>
            )}
            
            {student.category && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Category: {student.category}</span>
              </div>
            )}
          </div>
          
          {/* Additional fields section */}
          {fields.length > 0 && (
            <div className="mt-4 pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Additional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fields.map(field => {
                  // Skip already displayed fields and empty values
                  if (['name', 'student_id', 'email', 'phone', 'dob', 'gender', 'course', 'category'].includes(field) || !student[field]) {
                    return null;
                  }
                  
                  return (
                    <div key={field} className="flex flex-col">
                      <span className="text-xs text-muted-foreground capitalize">{field.replace('_', ' ')}</span>
                      <span className="text-sm">{student[field]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Extracted from {student.source_file || fileName}
            </Badge>
            {student.extraction_time && (
              <span className="text-xs text-muted-foreground">
                {new Date(student.extraction_time).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-sm">
      <div className="text-lg font-medium">Upload Student PDF</div>
      <p className="text-sm text-muted-foreground">Upload a PDF file to extract student data</p>
      
      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="w-full bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4 items-center">
        <label className="relative w-full">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary/80"
          />
        </label>
        
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={isLoading}
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isLoading ? 'Uploading...' : 'Select PDF File'}
        </Button>
      </div>
      
      {fileName && !isLoading && (
        <div className="flex items-center mt-2 text-sm">
          <FileText className="h-4 w-4 mr-2" />
          {fileName}
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm">Processing PDF...</span>
        </div>
      )}
      
      {/* Display extracted student data */}
      {extractedStudents.length > 0 && (
        <div className="mt-6 w-full">
          <h3 className="text-lg font-medium mb-4">Extracted Student Data</h3>
          <div className="space-y-4">
            {extractedStudents.map((student, index) => renderStudentCard(student, index))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        Supported features: student ID, name, date of birth, course, grade, email
      </div>
      
      {debugInfo && (
        <div className="mt-4 w-full">
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Debug Information</summary>
            <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded overflow-x-auto whitespace-pre-wrap break-words">
              {debugInfo}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
} 