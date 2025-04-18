import React from 'react';
import { Student } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Award, BookOpen, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EnhancedStudentCardProps {
  student: Student;
  onOsintLookup?: (student: Student) => void;
}

export function EnhancedStudentCard({ student, onOsintLookup }: EnhancedStudentCardProps) {
  const router = useRouter();
  
  const handleOsintLookup = () => {
    if (student.email) {
      // Redirect to the email lookup page with student's email auto-filled
      // but don't automatically trigger the search
      router.push(`/reversecontact-demo?email=${encodeURIComponent(student.email)}`);
    }
  };
  
  return (
    <Card className="w-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-slate-900">
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
      
      <CardHeader className="relative pt-20 pb-6 flex flex-col items-center">
        <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg animate-scaleIn">
          <AvatarImage src={student.image_url} alt={`${student.name} ${student.surname}`} />
          <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white">
            {student.name.charAt(0)}{student.surname ? student.surname.charAt(0) : ''}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white text-center">
          {student.name} {student.surname}
        </h3>
        {student.rollno && (
          <Badge variant="outline" className="mt-2 px-3 py-1 animate-slideUp">
            ID: {student.rollno}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="grid gap-6 pb-4 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
              <p className="text-slate-900 dark:text-white truncate">{student.email || 'Not provided'}</p>
            </div>
          </div>
          
          {student.father_name && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <Fingerprint className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Father&apos;s Name</p>
                <p className="text-slate-900 dark:text-white">{student.father_name}</p>
              </div>
            </div>
          )}
          
          {student.occupation && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Occupation</p>
                <p className="text-slate-900 dark:text-white">{student.occupation}</p>
              </div>
            </div>
          )}
          
          {student.category && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</p>
                <p className="text-slate-900 dark:text-white">{student.category}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Additional Information</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {student.religion && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Religion</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{student.religion}</span>
              </div>
            )}
            
            {student.subcast && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Sub-caste</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{student.subcast}</span>
              </div>
            )}
            
            {student.registrationNo && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Reg. No</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{student.registrationNo}</span>
              </div>
            )}
            
            {student.enrollmentNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Enrollment</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{student.enrollmentNumber}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
        <div className="w-full flex justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Student Profile</p>
          <div className="flex items-center space-x-2">
            {student.email && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs flex items-center gap-1"
                onClick={handleOsintLookup}
              >
                <Fingerprint className="h-3.5 w-3.5" />
                OSINT Lookup
              </Button>
            )}
            <div className="flex space-x-1">
              {student.github_url && (
                <a href={student.github_url} target="_blank" rel="noopener noreferrer" 
                   className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <svg className="h-4 w-4 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              {student.twitter_url && (
                <a href={student.twitter_url} target="_blank" rel="noopener noreferrer" 
                   className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <svg className="h-4 w-4 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.035 10.035 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 