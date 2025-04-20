"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/ui/search-bar';
import { StudentCard } from '@/components/student-card';
import { EnhancedStudentCard } from '@/components/enhanced-student-card';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Button } from '@/components/ui/button';
import { Glasses, LogOut, Moon, Sun, Search, List, ChevronDown, ChevronUp, Eye, Fingerprint, Github, Linkedin, Instagram, Facebook, Twitter, ExternalLink, Mail, FileText, AlertCircle, CheckCircle2, Database, User, Phone, Award, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase, Student } from '@/lib/supabase';
import { CSVImport } from '@/components/csv-import';
import { ClientOnly } from '@/components/client-only';
import { signOut } from '@/lib/session';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { AllStudentInfo } from '@/components/all-student-info';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { performOSINTLookup, generateMockOSINTData, OSINTResult } from '@/components/OSINTDashboard';
import { Input } from '@/components/ui/input';
import React from 'react';
import { generatePeoplifyAvatarParams, getStudentImageUrl, convertDbColumnToCamelCase } from '@/lib/utils';
import { RandomProfilePicture } from '@/components/RandomProfilePicture';
import { QuickSearchCard } from '@/components/quick-search-card';

// Add dynamic rendering config
export const dynamic = 'force-dynamic';

export default function Home() {
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showOsint, setShowOsint] = useState(false);
  const [osintStudent, setOsintStudent] = useState<Student | null>(null);
  const [osintResults, setOsintResults] = useState<any>(null);
  const [osintLoading, setOsintLoading] = useState(false);
  const [osintError, setOsintError] = useState<string | null>(null);
  const [socialProfiles, setSocialProfiles] = useState<any[]>([]);
  const [emailLookupInput, setEmailLookupInput] = useState('');
  const [lookupResults, setLookupResults] = useState<any>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
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
        
        const studentId = student.SRNO || student.ROLLNO || '';
        
        // Generate avatar params using our utility function
        const avatarParams = generatePeoplifyAvatarParams(studentId || student.EMAILID || fullName);
        
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
          // Use avatar params from the utility function
          image_url: avatarParams,
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

      // Add an extra step to assign random funny avatars to each student
      mappedResults = mappedResults.map(student => ({
        ...student,
        // Use the utility function
        image_url: generatePeoplifyAvatarParams(student.id || student.rollno || student.email)
      }));

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
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for students. Please try again.",
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

  const handleShowDetails = (student: Student) => {
    // First set the student with the data we already have to show some content immediately
    setSelectedStudent(student);
    setShowAllInfo(true);
    setIsLoadingDetails(true);
    
    // Then fetch more detailed data asynchronously
    const fetchDetailedStudentData = async () => {
      try {
        console.log('Fetching detailed data for student:', student.id || student.email);
        
        // Try different query approaches to maximize our chances of getting the data
        let data;
        let error;
        
        // Approach 1: Try using SRNO or ID
        if (student.id) {
          console.log('Trying to fetch by ID/SRNO:', student.id);
          const result = await supabase
            .from('student_data')
            .select('*')
            .eq('SRNO', student.id)
            .single();
            
          if (!result.error && result.data) {
            console.log('Successfully fetched data by SRNO');
            data = result.data;
          } else {
            error = result.error;
            console.warn('Failed to fetch by SRNO, error:', error?.message);
          }
        }
        
        // Approach 2: If ID didn't work, try email
        if (!data && student.email) {
          console.log('Trying to fetch by email:', student.email);
          const result = await supabase
            .from('student_data')
            .select('*')
            .eq('EMAILID', student.email)
            .single();
            
          if (!result.error && result.data) {
            console.log('Successfully fetched data by email');
            data = result.data;
          } else {
            error = result.error;
            console.warn('Failed to fetch by email, error:', error?.message);
          }
        }
        
        // Approach 3: Try various combinations of name and surname if available
        if (!data && student.name && student.surname) {
          console.log('Trying to fetch by name and surname');
          // First try FIRSTNAME + LAST NAME
          const result1 = await supabase
            .from('student_data')
            .select('*')
            .eq('FIRSTNAME', student.name)
            .eq('LAST NAME', student.surname)
            .maybeSingle();
            
          if (!result1.error && result1.data) {
            console.log('Successfully fetched data by FIRSTNAME + LAST NAME');
            data = result1.data;
          } else {
            // Try NAME field which might contain full name
            const fullName = `${student.name} ${student.surname}`;
            console.log('Trying to fetch by full name:', fullName);
            const result2 = await supabase
              .from('student_data')
              .select('*')
              .eq('NAME', fullName)
              .maybeSingle();
              
            if (!result2.error && result2.data) {
              console.log('Successfully fetched data by NAME (full name)');
              data = result2.data;
            } else {
              // Try ilike search on NAME as a last resort
              console.log('Trying fuzzy name search as last resort');
              const result3 = await supabase
                .from('student_data')
                .select('*')
                .ilike('NAME', `%${student.name}%${student.surname}%`)
                .maybeSingle();
                
              if (!result3.error && result3.data) {
                console.log('Successfully fetched data by fuzzy name search');
                data = result3.data;
              } else {
                error = result3.error || result2.error || result1.error;
                console.warn('All name-based queries failed');
              }
            }
          }
        }
        
        // Try the API endpoint as a final fallback
        if (!data && (student.id || student.email || (student.name && student.surname))) {
          console.log('Trying API endpoint as final fallback');
          try {
            // Construct query params
            const params = new URLSearchParams();
            if (student.id) params.append('id', student.id);
            if (student.email) params.append('email', student.email);
            if (student.name) params.append('name', student.name);
            if (student.surname) params.append('surname', student.surname);
            
            const response = await fetch(`/api/student/details?${params.toString()}`);
            
            if (response.ok) {
              const apiData = await response.json();
              if (apiData.success && apiData.data) {
                console.log('Successfully fetched data via API endpoint');
                // Map API response to a format compatible with the existing code
                data = Object.entries(apiData.data).reduce((acc, [key, value]) => {
                  // Convert back to uppercase for consistency with direct Supabase queries
                  const upperKey = key.toUpperCase();
                  acc[upperKey] = value;
                  return acc;
                }, {} as Record<string, any>);
              }
            } else {
              console.warn('API endpoint failed:', await response.text());
            }
          } catch (apiError) {
            console.error('Error using API endpoint:', apiError);
          }
        }
        
        if (!data) {
          console.error('Failed to fetch detailed student data after all attempts');
          if (error) {
            console.error('Last error:', error);
            toast({
              title: "Data Fetch Error",
              description: "Failed to fetch complete student details.",
              variant: "destructive",
            });
          }
          setIsLoadingDetails(false);
          return;
        }
        
        console.log('Fetched detailed student data:', data);
        console.log('Available columns:', Object.keys(data));
        
        // Create enhanced student object with all available fields
        const enhancedStudent: Student = {
          ...student, // Keep existing data
          
          // Map all fields from the database record to our Student interface
          // Basic fields
          id: data.SRNO || student.id,
          name: data.FIRSTNAME || (data.NAME ? data.NAME.split(' ')[0] : student.name),
          surname: data['LAST NAME'] || (data.NAME && data.NAME.includes(' ') ? data.NAME.split(' ').slice(1).join(' ') : student.surname),
          email: data.EMAILID || student.email,
          
          // Academic fields
          rollno: data.ROLLNO || student.rollno,
          registrationNo: data.REGISTRATION_NO || student.registrationNo,
          enrollmentNumber: data["ENROLLMENT NUMBER"] || student.enrollmentNumber,
          admissionType: data["ADMISSION TYPE"] || student.admissionType,
          
          // Personal details
          father_name: data.FATHERNAME || student.father_name,
          motherName: data.MOTHERNAME || student.motherName,
          occupation: data["FATHER'S OCCUPATION"] || student.occupation,
          motherOccupation: data["MOTHER'S OCCUPATION"] || student.motherOccupation,
          gender: data.GENDER || student.gender,
          dob: data.DOB || student.dob,
          mobileNo: data["MOBILE NO."] || student.mobileNo,
          nationality: data.NATIONALITY || student.nationality,
          bloodGroup: data["BLOOD GROUP"] || student.bloodGroup,
          maritalStatus: data["MARITAL STATUS"] || student.maritalStatus,
          category: data.CATEGORY || student.category,
          religion: data.RELIGION || student.religion,
          subcast: data.SUB_CASTE || student.subcast,
          adhaarNo: data["ADHAAR NO"] || student.adhaarNo,
          
          // Financial details
          annualFamilyIncome: data["ANNUAL FAMILY INCOME"] || student.annualFamilyIncome,
          bank_name: data["BANK NAME"] || student.bank_name,
          ifsccode: data["IFSC CODE"] || student.ifsccode,
          
          // Academic records
          tenth_marks_obtained: data["10TH MARKS OBTAINED"] || student.tenth_marks_obtained,
          tenth_out_of_marks: data["10TH OUT OF MARKS"] || student.tenth_out_of_marks,
          twelfth_marks_obtained: data["12TH MARKS OBTAINED"] || student.twelfth_marks_obtained,
          twelfth_out_of_marks: data["12TH OUT OF MARKS"] || student.twelfth_out_of_marks,
          diploma_marks_obtained: data["DIPLOMA MARKS"] || student.diploma_marks_obtained,
          entrance_exam_percentage: data["ENTRANCE EXAM PERCENTAGE"] || student.entrance_exam_percentage,
          
          // Contact information
          address_permanant: data["PERMANENT ADDRESS"] || student.address_permanant,
          city_village_permanant: data["PERMANENT CITY/VILLAGE"] || student.city_village_permanant,
          district_permanant: data["PERMANENT DISTRICT"] || student.district_permanant,
          state_permanant: data["PERMANENT STATE"] || student.state_permanant,
          address_local: data["LOCAL ADDRESS"] || student.address_local,
          pin_local: data["LOCAL PIN"] || student.pin_local,
          
          // Other details
          physically_handicapped: data["PHYSICALLY HANDICAPPED"] || student.physically_handicapped,
          height: data["HEIGHT"] || student.height,
          weight: data["WEIGHT"] || student.weight,
          sport_name: data["SPORT NAME"] || student.sport_name,
          
          // Social media URLs
          github_url: data["GITHUB URL"] || student.github_url,
          twitter_url: data["TWITTER URL"] || student.twitter_url,
          linkedin_url: data["LINKEDIN URL"] || student.linkedin_url,
          instagram_url: data["INSTAGRAM URL"] || student.instagram_url,
          
          // Extended fields - Add all other available fields from the database
          ...Object.entries(data).reduce((acc, [key, value]) => {
            // Convert column names to camelCase for our interface
            const camelKey = convertDbColumnToCamelCase(key);
            
            if (value !== null && value !== undefined && !Object.keys(student).includes(camelKey)) {
              acc[camelKey] = value;
            }
            return acc;
          }, {} as Record<string, any>),
          
          // Keep the image_url from the original student object
          image_url: student.image_url
        };
        
        console.log('Enhanced student object created with additional fields:', 
          Object.keys(enhancedStudent).filter(key => !Object.keys(student).includes(key)));
        
        // Update the selected student with enhanced data
        setSelectedStudent(enhancedStudent);
      } catch (err) {
        console.error('Unexpected error fetching student details:', err);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    
    // Call the fetch function
    fetchDetailedStudentData();
  };

  const handleCloseAllInfo = () => {
    setShowAllInfo(false);
    setSelectedStudent(null);
  };

  const showOsintModal = async (student: Student) => {
    setOsintStudent(student);
    setOsintResults(null);
    setOsintError(null);
    generateSocialProfiles(student);
    setShowOsint(true);
    
    // Only perform OSINT search if student has an email
    if (student.email) {
      setOsintLoading(true);
      try {
        // First try using our internal API
        try {
          const response = await fetch('/api/osint/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: student.email }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setOsintResults(data);
            setOsintLoading(false);
            return; // Successfully got data from internal API
          }
        } catch (internalError) {
          console.warn('Internal OSINT API failed, falling back to direct lookup:', internalError);
        }
        
        // Fallback to direct lookup using performOSINTLookup
        console.log('Using fallback OSINT lookup for:', student.email);
        const osintData: OSINTResult = await performOSINTLookup(student.email);
        
        if (osintData.error) {
          throw new Error(osintData.error);
        }
        
        // Convert the data format to match what the UI expects
        const processedData = {
          professional_info: {
            domain: student.email.split('@')[1] || '',
            linkedin: {
              company_info: osintData.company ? [
                {
                  name: osintData.company.name,
                  industry: osintData.company.industry || 'Unknown',
                  size: osintData.company?.employeeCount?.toString() || 'Unknown',
                  location: osintData.company.headquarter ? 
                    `${osintData.company.headquarter.city}, ${osintData.company.headquarter.geographicArea}` : 
                    'Unknown'
                }
              ] : [],
              people_results: [
                {
                  name: `${osintData.person?.firstName || ''} ${osintData.person?.lastName || ''}`,
                  title: osintData.person?.headline || '',
                  company: osintData.person?.positions?.positionHistory?.[0]?.companyName || '',
                  location: osintData.person?.location || ''
                }
              ]
            },
            social_profiles: osintData.person?.socialProfiles?.map((profile) => ({
              platform: profile.platform,
              url: profile.url,
              username: profile.username
            })) || []
          }
        };
        
        setOsintResults(processedData);
      } catch (error) {
        console.error('OSINT search error:', error);
        setOsintError('Failed to retrieve OSINT data. Please try again later.');
      } finally {
        setOsintLoading(false);
      }
    }
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

  const handleEmailLookup = async () => {
    if (!emailLookupInput) {
      setLookupError('Please enter an email address');
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLookupInput)) {
      setLookupError('Please enter a valid email address');
      return;
    }

    setIsLookupLoading(true);
    setLookupError(null);
    setLookupResults(null);

    try {
      // Try using the enrichment API directly
      const response = await fetch(`/api/enrichment?email=${encodeURIComponent(emailLookupInput)}`);
      
      if (response.ok) {
        const data = await response.json();
        setLookupResults(data);
      } else {
        // If API call fails, use performOSINTLookup function
        console.warn('API lookup failed, using fallback method');
        const osintData = await performOSINTLookup(emailLookupInput);
        
        if (osintData.error) {
          throw new Error(osintData.error);
        }
        
        setLookupResults(osintData);
      }
    } catch (error: any) {
      console.error('Email lookup error:', error);
      setLookupError(error.message || 'Failed to lookup email');
    } finally {
      setIsLookupLoading(false);
    }
  };

  const renderEmailLookup = () => {
    // Create the content element outside of ClientOnly
    const emailLookupContent = (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-500" />
            Reverse Email Lookup
          </CardTitle>
          <CardDescription>
            Find detailed profile information from an email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <Input
                  type="email"
                  placeholder="Enter an email address"
                  value={emailLookupInput}
                  onChange={(e) => setEmailLookupInput(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleEmailLookup}
                disabled={isLookupLoading || !emailLookupInput}
                className={isLookupLoading ? "animate-pulse" : ""}
              >
                {isLookupLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </>
                )}
              </Button>
            </div>
            
            {lookupError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200 flex items-start">
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}
            
            {lookupResults && (
              <div className="mt-4 animate-fadeIn">
                <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-200 mb-4 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Successfully found information for {emailLookupInput}</span>
                </div>
                
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Profile Information
                    </h3>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {/* Person Information */}
                    {lookupResults.person && (
                      <div className="flex flex-col sm:flex-row gap-4">
                        {lookupResults.person.photoUrl && (
                          <div className="flex-shrink-0">
                            <img 
                              src={lookupResults.person.photoUrl} 
                              alt={`${lookupResults.person.firstName || ''} ${lookupResults.person.lastName || ''}`}
                              className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        )}
                        
                        <div className="flex-grow">
                          <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                            {lookupResults.person.firstName} {lookupResults.person.lastName}
                          </h4>
                          
                          {lookupResults.person.headline && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {lookupResults.person.headline}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                            {lookupResults.person.location && (
                              <div className="flex items-center text-sm">
                                <Search className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                <span>{lookupResults.person.location}</span>
                              </div>
                            )}
                            
                            {lookupResults.person.linkedInUrl && (
                              <div className="flex items-center text-sm">
                                <Linkedin className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                <a 
                                  href={lookupResults.person.linkedInUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  LinkedIn Profile
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {lookupResults.person.skills && lookupResults.person.skills.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-slate-500 mb-1">Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {lookupResults.person.skills.map((skill: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Company Information */}
                    {lookupResults.company && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-3">
                          Company Information
                        </h4>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          {lookupResults.company.logo && (
                            <div className="flex-shrink-0">
                              <img 
                                src={lookupResults.company.logo} 
                                alt={lookupResults.company.name || 'Company logo'}
                                className="w-16 h-16 rounded object-contain border border-slate-200 dark:border-slate-700 bg-white p-1"
                              />
                            </div>
                          )}
                          
                          <div className="flex-grow">
                            <h5 className="font-medium text-slate-800 dark:text-slate-200">
                              {lookupResults.company.name}
                            </h5>
                            
                            {lookupResults.company.industry && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Industry: {lookupResults.company.industry}
                              </p>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {lookupResults.company.websiteUrl && (
                                <div className="flex items-center text-sm">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                                  <a 
                                    href={lookupResults.company.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {lookupResults.company.websiteUrl.replace(/^https?:\/\//, '')}
                                  </a>
                                </div>
                              )}
                              
                              {lookupResults.company.linkedInUrl && (
                                <div className="flex items-center text-sm">
                                  <Linkedin className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                  <a 
                                    href={lookupResults.company.linkedInUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    Company LinkedIn
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* API Information */}
                    <div className="text-right text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p>Credits remaining: {lookupResults.credits_left}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              <p>Try example: bill.gates@microsoft.com or satya@microsoft.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );

    return <ClientOnly>{emailLookupContent}</ClientOnly>;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-16">
      {/* Navigation Bar */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-all duration-200 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <div className="flex items-center flex-shrink-0 mobile-ripple p-2 rounded-full">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg shadow-teal-400/20 shadow-lg">
                  <Glasses className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold ml-2 gradient-text">
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
                className="mobile-ripple rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300"
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
                className="text-slate-700 dark:text-slate-200 hidden sm:flex mobile-ripple transition-colors duration-300"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="mobile-ripple rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden transition-colors duration-300"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 mb-20">
        {/* Search Section */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight animate-fadeIn gradient-text">
            Find Students
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto animate-fadeIn">
            Search through our comprehensive database of students
          </p>
          <div className="max-w-3xl mx-auto glass-card p-4 sm:p-6 animate-swipeUp">
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
        {searchResults.length > 0 && (
          <div className="space-y-8 animate-swipeUp">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <h3 className="text-2xl font-bold flex items-center">
                <span className="gradient-text">Search Results</span> 
                <Badge className="ml-3 px-3 py-1 animate-fadeIn badge-primary">
                  {searchResults.length} student{searchResults.length !== 1 ? 's' : ''}
                </Badge>
              </h3>
            </div>
            
            {/* Student Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((student, index) => (
                <div key={index} className="animate-cardEntrance relative" style={{ animationDelay: `${index * 0.05}s` }}>
                  <QuickSearchCard 
                    student={student}
                    onShowDetails={handleShowDetails}
                    onOsintLookup={showOsintModal}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !isSearching && (
          <div className="text-center mt-10 glass-card p-8 sm:p-12 animate-fadeIn">
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
          <div className="text-center mt-10 glass-card p-8 sm:p-12 animate-fadeIn">
            <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <div className="h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-teal-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-2">
              Searching...
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Looking for students matching your search criteria
            </p>
          </div>
        )}
      </main>

      {/* All Student Information Modal - Only show when showAllInfo is true */}
      {showAllInfo && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-popIn">
            <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg mr-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold gradient-text">
                  {selectedStudent.name} {selectedStudent.surname} - Complete Information
                </h2>
                
                {isLoadingDetails && (
                  <div className="ml-4 flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading additional data...</span>
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCloseAllInfo}
                className="mobile-ripple rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <div className="h-6 w-6 flex items-center justify-center">✕</div>
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AllStudentInfo student={selectedStudent} />
            </div>
            
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 z-10 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => showOsintModal(selectedStudent)}
                className="mobile-ripple"
                disabled={!selectedStudent.email}
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                OSINT Lookup
              </Button>
              <Button onClick={handleCloseAllInfo} className="btn-primary mobile-ripple">Close</Button>
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
                  {osintLoading ? 'Gathering Intelligence...' : 'Social Media Profiles'}
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 glass-card p-4 rounded-lg animate-swipeUp">
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
                      <Badge className="flex items-center gap-1 px-2 py-1 badge-primary">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{osintStudent.email}</span>
                      </Badge>
                    )}
                    {osintStudent.rollno && (
                      <Badge className="flex items-center gap-1 px-2 py-1 badge-secondary">
                        <span className="text-xs">ID: {osintStudent.rollno}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {osintLoading && (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-10 w-10 text-teal-500 animate-spin mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Searching social networks and professional databases...
                  </p>
                </div>
              )}

              {/* Error state */}
              {osintError && !osintLoading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 animate-swipeUp">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {osintError}
                  </p>
                </div>
              )}

              {/* Results from OSINT API */}
              {osintResults && !osintLoading && (
                <>
                  {/* Domain Info */}
                  {osintResults.professional_info?.domain && (
                    <div className="mb-6 animate-swipeUp" style={{animationDelay: '0.1s'}}>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                        Domain Information
                      </h3>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                        <p className="text-slate-700 dark:text-slate-300">
                          <span className="font-medium">Domain:</span> {osintResults.professional_info.domain}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Results */}
                  {osintResults.professional_info?.linkedin && (
                    <div className="mb-6 animate-swipeUp" style={{animationDelay: '0.15s'}}>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                        Professional Information
                      </h3>
                      
                      {/* Company Info */}
                      {osintResults.professional_info.linkedin.company_info && osintResults.professional_info.linkedin.company_info.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-2">
                            Related Companies
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {osintResults.professional_info.linkedin.company_info.map((company: any, index: number) => (
                              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <p className="font-medium text-slate-900 dark:text-slate-100">{company.name || 'Unknown Company'}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Industry: {company.industry || 'N/A'}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Size: {company.size || 'N/A'}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Location: {company.location || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* People Results */}
                      {osintResults.professional_info.linkedin.people_results && osintResults.professional_info.linkedin.people_results.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-2">
                            Related People
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {osintResults.professional_info.linkedin.people_results.map((person: any, index: number) => (
                              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <p className="font-medium text-slate-900 dark:text-slate-100">{person.name || 'Unknown Person'}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Title: {person.title || 'N/A'}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Company: {person.company || 'N/A'}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Location: {person.location || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Media Profiles */}
                  {osintResults.professional_info?.social_profiles && osintResults.professional_info.social_profiles.length > 0 ? (
                    <div className="mb-6 animate-swipeUp" style={{animationDelay: '0.2s'}}>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                        Verified Social Media Profiles
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {osintResults.professional_info.social_profiles.map((profile: any, index: number) => (
                          <a
                            key={index}
                            href={profile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white mr-3">
                              {profile.platform === 'GitHub' ? 'GH' : 
                               profile.platform === 'Twitter' ? 'TW' : 
                               profile.platform === 'LinkedIn' ? 'LI' : '?'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{profile.platform}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">@{profile.username}</p>
                            </div>
                            <div className="ml-auto">
                              <ExternalLink className="h-4 w-4 text-slate-400" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : !osintLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 animate-swipeUp" style={{animationDelay: '0.2s'}}>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        No verified social media profiles were found based on this email address. Showing potential profiles based on the student&apos;s name instead.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Warning notice */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6 animate-swipeUp" style={{animationDelay: '0.1s'}}>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  These are potential social media profiles based on this student&apos;s information. 
                  Always verify identity before drawing any conclusions.
                </p>
              </div>

              {/* Name-based profiles if no email results or as additional information */}
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