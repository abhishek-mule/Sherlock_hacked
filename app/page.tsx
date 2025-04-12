"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/ui/search-bar';
import { StudentCard } from '@/components/student-card';
import { EnhancedStudentCard } from '@/components/enhanced-student-card';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Button } from '@/components/ui/button';
import { Glasses, LogOut, Moon, Sun, Search, List, ChevronDown, ChevronUp, Eye, Fingerprint, Github, Linkedin, Instagram, Facebook, Twitter, ExternalLink, Mail } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase, Student } from '@/lib/supabase';
import { CSVImport } from '@/components/csv-import';
import { ClientOnly } from '@/components/client-only';
import { signOut } from '@/lib/session';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { AllStudentInfo } from '@/components/all-student-info';

// Add dynamic rendering config
export const dynamic = 'force-dynamic';

export default function Home() {
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showOsint, setShowOsint] = useState(false);
  const [osintStudent, setOsintStudent] = useState<Student | null>(null);
  const [socialProfiles, setSocialProfiles] = useState<any[]>([]);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Add useEffect to check authentication when the page loads
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // No active session, redirect to login
        console.log('No active session, redirecting to login');
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSearch = async (name: string, surname?: string) => {
    setIsSearching(true);
    try {
      console.log('Search params:', { name, surname });
      
      if (!name && !surname) {
        console.log('No search parameters provided');
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      console.log('Searching with uppercase column names');

      // Create a case-insensitive search using ilike with the actual column names from DB
      console.log('Executing Supabase query with case-insensitive search...');
      let { data, error } = await supabase
        .from('student_data')
        .select('*')
        .or(`NAME.ilike.%${name}%,FIRSTNAME.ilike.%${name}%`);

      if (error) {
        console.error('Supabase query error:', error);
        toast({
          title: "Search Error",
          description: "Failed to search for students. Please try again.",
          variant: "destructive",
        });
        setSearchResults([]);
        return;
      }

      // Debug information about columns and results
      console.log('Raw data returned from database:', data);
      console.log(`Query returned ${data?.length || 0} total records`);
      
      if (data && data.length > 0) {
        console.log('First record columns:', Object.keys(data[0]));
      } else {
        // Try searching in the ROLLNO field as well
        console.log('No results found. Trying ROLLNO search...');
        const { data: rollnoData, error: rollnoError } = await supabase
          .from('student_data')
          .select('*')
          .ilike('ROLLNO', `%${name}%`);
          
        if (!rollnoError && rollnoData && rollnoData.length > 0) {
          console.log('Found matches with ROLLNO search:', rollnoData.length);
          data = rollnoData;
        } else {
          // Try searching in all text fields
          console.log('No results with specific column search. Trying broader search...');
          
          // Get all data and filter in JavaScript
          const { data: allData, error: allError } = await supabase
            .from('student_data')
            .select('*')
            .limit(100); // Limit to prevent excessive data transfer
            
          if (!allError && allData && allData.length > 0) {
            console.log('Found records in the table:', allData.length);
            // Filter manually in JavaScript
            const searchTerm = name.toLowerCase();
            const filteredData = allData.filter(record => {
              // Check NAME, FIRSTNAME, LAST NAME fields
              const fullName = (record.NAME || '').toLowerCase();
              const firstName = (record.FIRSTNAME || '').toLowerCase();
              const lastName = (record['LAST NAME'] || '').toLowerCase();
              const rollNo = String(record.ROLLNO || '').toLowerCase();
              
              return fullName.includes(searchTerm) || 
                     firstName.includes(searchTerm) || 
                     lastName.includes(searchTerm) || 
                     rollNo.includes(searchTerm);
            });
            
            if (filteredData.length > 0) {
              console.log('Found matches with manual filtering:', filteredData.length);
              data = filteredData;
            }
          }
        }
      }
      
      // Map the database records to our Student interface
      let mappedResults = (data || []).map(student => {
        // Use the actual column names from the database
        const fullName = student.NAME || '';
        const firstName = student.FIRSTNAME || '';
        const lastName = student['LAST NAME'] || '';
        
        console.log(`Mapping record with fullName: "${fullName}", firstName: "${firstName}", lastName: "${lastName}"`);
        
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
          // Additional fields from the schema
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

      // Filter out records with insufficient information
      mappedResults = mappedResults.filter(student => {
        // Calculate a "completeness score" based on available fields
        let hasData = false;
        
        // Required fields (must have at least one of these to be considered valid)
        if (student.name && student.name.trim().length > 1) hasData = true;
        
        // Supporting fields (not required but improve the record quality)
        let detailsScore = 0;
        if (student.rollno) detailsScore += 3;
        if (student.email) detailsScore += 2;
        if (student.registrationNo) detailsScore += 2;
        if (student.father_name) detailsScore += 1;
        if (student.motherName) detailsScore += 1;
        if (student.enrollmentNumber) detailsScore += 2;
        if (student.dob) detailsScore += 1;
        
        // Check if this is likely a valid student record (has name + some details)
        return hasData && detailsScore > 0;
      });

      console.log('Final filtered results:', mappedResults);
      
      if (mappedResults.length === 0) {
        toast({
          title: "No Results",
          description: "No students found matching your search criteria.",
          variant: "default",
        });
      }

      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Error searching students:', error);
      toast({
        title: "Search Error",
        description: "An unexpected error occurred while searching. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

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

  const handleShowAllInfo = (student: Student) => {
    setSelectedStudent(student);
    setShowAllInfo(true);
  };

  const handleCloseAllInfo = () => {
    setShowAllInfo(false);
    setSelectedStudent(null);
  };

  const showOsintModal = (student: Student) => {
    setOsintStudent(student);
    generateSocialProfiles(student);
    setShowOsint(true);
  };

  const generateSocialProfiles = (student: Student) => {
    const fullName = `${student.name} ${student.surname}`.trim();
    const nameParts = fullName.split(/\s+/);
    let firstName = "";
    let lastName = "";
    
    if (nameParts.length === 1) {
      firstName = nameParts[0];
    } else if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join("");
    }
    
    // Convert to lowercase and remove special characters
    firstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    lastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Generate different username patterns
    const usernameFormats = [
      `${firstName}${lastName}`,
      `${firstName}.${lastName}`,
      `${firstName}_${lastName}`,
      `${firstName}${lastName[0]}`,
      `${firstName[0]}${lastName}`,
      lastName.length > 0 ? lastName : firstName,
    ];
    
    // Generate profiles for different platforms
    const profiles = [
      {
        platform: "GitHub",
        url: `https://github.com/${usernameFormats[0]}`,
        icon: Github,
        username: usernameFormats[0],
        color: "bg-slate-800 dark:bg-slate-700"
      },
      {
        platform: "LinkedIn",
        url: `https://www.linkedin.com/in/${usernameFormats[1]}`,
        icon: Linkedin,
        username: usernameFormats[1],
        color: "bg-blue-600 dark:bg-blue-700"
      },
      {
        platform: "Instagram",
        url: `https://www.instagram.com/${usernameFormats[2]}`,
        icon: Instagram,
        username: usernameFormats[2],
        color: "bg-pink-600 dark:bg-pink-700"
      },
      {
        platform: "Facebook",
        url: `https://www.facebook.com/${usernameFormats[0]}`,
        icon: Facebook,
        username: usernameFormats[0],
        color: "bg-blue-500 dark:bg-blue-600"
      },
      {
        platform: "Twitter",
        url: `https://twitter.com/${usernameFormats[2]}`,
        icon: Twitter,
        username: usernameFormats[2],
        color: "bg-sky-500 dark:bg-sky-600"
      }
    ];
    
    setSocialProfiles(profiles);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200 mobile-scrollview">
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-all duration-200 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <div className="flex items-center flex-shrink-0 mobile-ripple p-2 rounded-full">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg">
                  <Glasses className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white ml-2">
                Sherlock
              </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4">
              <div className="hidden sm:block">
              <CSVImport />
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="mobile-ripple rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ClientOnly>
                  {theme === "dark" ? 
                    <Sun className="h-5 w-5 text-amber-500" /> : 
                    <Moon className="h-5 w-5 text-slate-700" />
                  }
                </ClientOnly>
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-700 dark:text-slate-200 hidden sm:flex mobile-ripple"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="mobile-ripple rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28">
        {/* Search Section */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight animate-fadeIn">
            Find Students
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto animate-fadeIn">
            Search through our comprehensive database of students
          </p>
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-800 animate-swipeUp">
            <SearchBar onSearch={handleSearch} isSearching={isSearching} />
            <div className="flex justify-end mt-3">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Search className="h-3 w-3" />
                Try searching by name, ID, or roll number
              </p>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !showAllInfo && (
          <div className="space-y-6 animate-swipeUp">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <span>Search Results</span> 
                <Badge variant="outline" className="ml-3 px-3 py-1 animate-fadeIn">
                  {searchResults.length} student{searchResults.length !== 1 ? 's' : ''}
                </Badge>
              </h3>
              <div className="flex gap-2">
                <Badge variant="secondary" className="px-3 py-1.5 text-xs bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <Search className="h-3 w-3 mr-1" />
                  Exact Matches
                </Badge>
              </div>
            </div>
            
            {searchResults.length > 1 ? (
              <div className="bg-white dark:bg-slate-900/60 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md">                
                <div className="space-y-4">
                  {searchResults.map((student, index) => (
                    <div 
                      key={student.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-swipeRight"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="flex-shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full h-14 w-14 flex items-center justify-center text-white font-bold mb-3 sm:mb-0">
                        {student.name.charAt(0)}{student.surname ? student.surname.charAt(0) : ''}
                      </div>
                      
                      <div className="sm:ml-4 flex-1 w-full">
                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                          {student.name} {student.surname}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-2">
                          <div className="flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-teal-500 dark:text-teal-400" /> 
                            <span className="truncate">{student.email || 'No email'}</span>
                          </div>
                          {student.rollno && (
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-1.5 h-3.5 w-3.5 p-0 flex items-center justify-center text-xs text-teal-600">ID</Badge>
                              {student.rollno}
                            </div>
                          )}
                          {student.registrationNo && (
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-1.5 h-3.5 w-3.5 p-0 flex items-center justify-center text-xs text-cyan-600">R</Badge>
                              {student.registrationNo}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 flex flex-wrap sm:flex-nowrap gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
                        <Button 
                          onClick={() => setSearchResults([student])}
                          size="sm" 
                          variant="outline"
                          className="flex-1 sm:flex-auto mobile-ripple"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Details
                        </Button>
                        <Button 
                          onClick={() => handleShowAllInfo(student)}
                          size="sm" 
                          variant="outline"
                          className="flex-1 sm:flex-auto flex items-center space-x-1 mobile-ripple"
                        >
                          <List className="h-3.5 w-3.5 mr-1.5" />
                          <span>All Info</span>
                        </Button>
                        <Button 
                          onClick={() => showOsintModal(student)}
                          size="sm" 
                          variant="outline"
                          className="flex-1 sm:flex-auto flex items-center space-x-1 mobile-ripple"
                        >
                          <Fingerprint className="h-3.5 w-3.5 mr-1.5" />
                          <span>OSINT</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>                
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
            {searchResults.map((student) => (
                  <div key={student.id} className="relative animate-popIn">
                    <div className="absolute top-4 right-4 z-10 flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleShowAllInfo(student)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mobile-ripple"
                      >
                        <List className="h-3.5 w-3.5 mr-1.5" />
                        <span>All Info</span>
                      </Button>
                      <Button
                        onClick={() => showOsintModal(student)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mobile-ripple"
                      >
                        <Fingerprint className="h-3.5 w-3.5 mr-1.5" />
                        <span>OSINT</span>
                      </Button>
                    </div>
                    <EnhancedStudentCard student={student} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !isSearching && (
          <div className="text-center mt-10 bg-white dark:bg-slate-900/60 rounded-xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-md animate-fadeIn">
            <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6 animate-pulse-soft">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Try searching for a student&apos;s name, ID, or registration number
            </p>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center mt-10 bg-white dark:bg-slate-900/60 rounded-xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-md animate-fadeIn">
            <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <div className="h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-teal-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Searching...
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Looking for students matching your search criteria
            </p>
          </div>
        )}
      </main>

      {/* All Student Information Modal */}
      {showAllInfo && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto animate-fadeIn">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-popIn mobile-scrollview">
              <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Complete Information: {selectedStudent.name} {selectedStudent.surname}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCloseAllInfo}
                  className="mobile-ripple rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <div className="h-6 w-6 flex items-center justify-center">✕</div>
                </Button>
              </div>
              
              <div className="p-6">
                <AllStudentInfo student={selectedStudent} />
              </div>
              
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 z-10 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <Button onClick={handleCloseAllInfo} className="mobile-ripple">Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OSINT Modal */}
      {showOsint && osintStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-popIn">
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 z-10 p-4 flex justify-between items-center text-white">
              <div className="flex items-center">
                <Fingerprint className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">
                  Social Media Profiles
                </h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowOsint(false)}
                className="mobile-ripple rounded-full text-white hover:bg-white/20"
              >
                <div className="h-6 w-6 flex items-center justify-center">✕</div>
              </Button>
            </div>

            <div className="p-6 overflow-y-auto mobile-scrollview">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg animate-swipeUp">
                <div className="flex-shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full h-16 w-16 flex items-center justify-center text-white font-bold text-xl mx-auto sm:mx-0">
                  {osintStudent.name.charAt(0)}
                  {osintStudent.surname ? osintStudent.surname.charAt(0) : ''}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    {osintStudent.name} {osintStudent.surname}
                  </h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    {osintStudent.email && (
                      <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{osintStudent.email}</span>
                      </Badge>
                    )}
                    {osintStudent.rollno && (
                      <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                        <span className="text-xs">ID: {osintStudent.rollno}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6 animate-swipeUp" style={{animationDelay: '0.1s'}}>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  These are potential social media profiles based on this student&apos;s name. The actual profiles may differ.
                  Always verify identity before drawing any conclusions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialProfiles.map((profile, index) => (
                  <a
                    key={index}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col h-full items-center p-5 rounded-lg border border-slate-200 dark:border-slate-700 
                             hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden mobile-ripple animate-swipeUp"
                    style={{animationDelay: `${(index + 2) * 0.05}s`}}
                  >
                    <div className={`w-14 h-14 ${profile.color} rounded-full flex items-center justify-center mb-3 text-white transform transition-transform group-hover:scale-110`}>
                      <profile.icon className="h-7 w-7" />
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white mb-1">
                      {profile.platform}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      @{profile.username}
                    </p>
                    <div className="mt-auto pt-3 flex items-center text-xs text-teal-600 dark:text-teal-400">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>Visit Profile</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500 transform translate-y-full transition-transform group-hover:translate-y-0"></div>
                  </a>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowOsint(false)}
                  className="w-full sm:w-auto mobile-ripple"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}