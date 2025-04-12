"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Glasses, LogOut, Moon, Sun, Search, ArrowLeft, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase, Student } from '@/lib/supabase';
import { ClientOnly } from '@/components/client-only';
import { signOut } from '@/lib/session';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

// Add dynamic rendering config
export const dynamic = 'force-dynamic';

export default function OSINT() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Check authentication when the page loads
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log('No active session, redirecting to login');
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Fetch all students on page load
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('student_data')
          .select('*')
          .limit(50);
          
        if (error) {
          console.error('Error fetching students:', error);
          return;
        }
        
        // Map to our Student interface
        const mappedStudents = (data || []).map(student => {
          const fullName = student.NAME || '';
          const firstName = student.FIRSTNAME || '';
          const lastName = student['LAST NAME'] || '';
          
          return {
            id: student.SRNO || '',
            name: firstName || fullName.split(' ')[0] || '',
            surname: lastName || (fullName.includes(' ') ? fullName.split(' ').slice(1).join(' ') : ''),
            email: student.EMAILID || '',
            father_name: student.FATHERNAME || '',
            occupation: student["FATHER'S OCCUPATION"] || '',
            category: student.CATEGORY || '',
            religion: student.RELIGION || '',
            subcast: student.SUB_CASTE || '',
            rollno: student.ROLLNO || '',
            registrationNo: student.REGISTRATION_NO || '',
            enrollmentNumber: student["ENROLLMENT NUMBER"] || '',
            admissionType: student["ADMISSION TYPE"] || '',
            mobileNo: student["MOBILE NO."] || '',
            dob: student.DOB || '',
            gender: student.GENDER || '',
            nationality: student.NATIONALITY || '',
            bloodGroup: student["BLOOD GROUP"] || '',
            maritalStatus: student["MARITAL STATUS"] || '',
            socialCategory: student["SOCIAL CATEGORY"] || '',
            adhaarNo: student["ADHAAR NO"] || '',
            motherName: student.MOTHERNAME || '',
            motherOccupation: student["MOTHER'S OCCUPATION"] || '',
            annualFamilyIncome: student["ANNUAL FAMILY INCOME"] || '',
            image_url: 'https://i.pravatar.cc/150?img=' + (parseInt(student.SRNO) || 1),
            github_url: '',
            twitter_url: '',
            linkedin_url: '',
            instagram_url: ''
          };
        });
        
        setStudents(mappedStudents);
      } catch (error) {
        console.error('Error in fetchStudents:', error);
      }
    };
    
    fetchStudents();
  }, []);

  const handleLogout = async () => {
    try {
      const success = await signOut();
      if (success) {
        router.push('/login');
      } else {
        toast({
          title: "Logout Failed",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Filter students locally based on search term
    const filteredStudents = students.filter(student => {
      const fullName = `${student.name} ${student.surname}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    
    setIsSearching(false);
    
    if (filteredStudents.length === 0) {
      toast({
        title: "No Results",
        description: "No students found matching your search criteria.",
        variant: "default",
      });
    } else if (filteredStudents.length === 1) {
      setSelectedStudent(filteredStudents[0]);
    } else {
      // Show the first match for simplicity
      setSelectedStudent(filteredStudents[0]);
    }
  };

  // Generate social media profile URLs
  const generateSocialLinks = (student: Student) => {
    const fullName = `${student.name} ${student.surname}`.replace(/\s+/g, '');
    const formattedName = `${student.name} ${student.surname}`.replace(/\s+/g, '+');
    
    return {
      github: `https://github.com/${fullName}`,
      linkedin: `https://www.linkedin.com/search/results/all/?keywords=${formattedName}`,
      instagram: `https://www.instagram.com/${fullName.toLowerCase()}`,
      facebook: `https://www.facebook.com/search/top?q=${formattedName}`,
      twitter: `https://twitter.com/${fullName.toLowerCase()}`,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <ArrowLeft className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
                <Glasses className="h-8 w-8 text-teal-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white ml-2">
                  Sherlock - OSINT
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-slate-700 dark:text-slate-200"
              >
                <ClientOnly>
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </ClientOnly>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-700 dark:text-slate-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        {/* Search Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            OSINT Search
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Search social media profiles for students
          </p>
          
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter student name"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white rounded-md px-4 py-2"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </div>

        {/* OSINT Results */}
        {selectedStudent && (
          <div className="bg-white dark:bg-slate-900/60 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
              <div className="flex-shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full h-24 w-24 flex items-center justify-center text-white font-bold text-3xl mb-4 md:mb-0 md:mr-6">
                {selectedStudent.name.charAt(0)}{selectedStudent.surname ? selectedStudent.surname.charAt(0) : ''}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedStudent.name} {selectedStudent.surname}
                </h3>
                
                {selectedStudent.email && (
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    Email: {selectedStudent.email}
                  </p>
                )}
                
                {selectedStudent.mobileNo && (
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    Phone: {selectedStudent.mobileNo}
                  </p>
                )}
                
                {selectedStudent.rollno && (
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    Roll No: {selectedStudent.rollno}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Possible Social Media Profiles
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(generateSocialLinks(selectedStudent)).map(([platform, url]) => (
                  <a 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white ${
                      platform === 'github' ? 'bg-gray-900' :
                      platform === 'linkedin' ? 'bg-blue-600' :
                      platform === 'instagram' ? 'bg-pink-600' :
                      platform === 'facebook' ? 'bg-blue-700' :
                      'bg-sky-500' // Twitter
                    }`}>
                      <span className="text-lg font-bold">{platform.charAt(0).toUpperCase()}</span>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {url.replace(/^https?:\/\/(www\.)?/, '')}
                      </p>
                    </div>
                    
                    <ExternalLink className="flex-shrink-0 h-4 w-4 text-slate-400" />
                  </a>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> These links are generated based on the student's name and are not guaranteed to be accurate. 
                  OSINT (Open Source Intelligence) tools should be used responsibly and ethically.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!selectedStudent && !isSearching && (
          <div className="text-center mt-12 bg-white dark:bg-slate-900/60 rounded-xl p-12 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Search for a student
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Enter a student's name to find their potential social media profiles
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
} 