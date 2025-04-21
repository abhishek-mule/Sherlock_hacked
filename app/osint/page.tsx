"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Fingerprint, 
  Github, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Twitter, 
  ExternalLink, 
  Mail, 
  Search as SearchIcon,
  Globe,
  Building as BusinessIcon,
  User as PersonIcon,
  AlertCircle,
  ArrowRight,
  AtSign
} from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from 'react-minimal-pie-chart';

interface SocialProfile {
  platform: string;
  url: string;
  handle?: string;
}

interface SocialHandle {
  platform: string;
  handle: string;
  url: string;
}

interface WorkPosition {
  title: string;
  company?: {
    name?: string;
    industry?: string;
    size?: string;
  };
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

interface Education {
  school?: {
    name?: string;
  };
  degree?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

interface OsintResults {
  basic_info?: {
    email?: string;
    name?: string;
  };
  professional_info?: {
    social_profiles?: any[];
    sources?: string[];
    domain?: string;
    job_title?: string;
    location?: string;
    photo_url?: string | null;
    connection_count?: number | null;
    last_updated?: string;
    linkedin_url?: string;
    work?: WorkPosition[];
    education?: Education[];
    company?: {
      name?: string;
      website?: string;
      industry?: string;
      size?: string;
      location?: string;
      description?: string;
      logo?: string | null;
    };
  };
  is_mock_data?: boolean;
}

export default function OSINTPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [osintResults, setOsintResults] = useState<OsintResults | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMockData, setIsMockData] = useState(false);
  const [showNewUI, setShowNewUI] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    // Read the query parameter when the component mounts
    if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const name = searchParams?.get("name");
      const email = searchParams?.get("email");
    
    if (name) {
      setStudentName(name);
      generateSocialProfiles(name);
      }
        
      if (email) {
        setStudentEmail(email);
        handleOsintSearch(email);
      }
    }
  }, []);
  
  const handleOsintSearch = async (emailOrUrl: string) => {
    if (!emailOrUrl) {
      setError('Please enter an email address or LinkedIn URL');
      return;
    }

    setLoading(true);
    setError(null);
    setOsintResults(null);

    try {
      // Determine if input is email or LinkedIn URL
      const isEmail = emailOrUrl.includes('@');
      const endpoint = '/api/osint/enrichment';
      const searchParam = isEmail ? `email=${encodeURIComponent(emailOrUrl)}` : `linkedin_url=${encodeURIComponent(emailOrUrl)}`;
      
      // Set for UI display
      if (isEmail) {
        setStudentEmail(emailOrUrl);
        setLinkedinUrl('');
      } else {
        setLinkedinUrl(emailOrUrl);
        setStudentEmail('');
      }

      console.log(`Performing OSINT search for ${isEmail ? 'email' : 'LinkedIn URL'}: ${emailOrUrl}`);
      const response = await fetch(`${endpoint}?${searchParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      
      // Check if this is mock data
      setIsMockData(data.data?.is_mock_data === true);
      
      // Create display-friendly data structure
      setOsintResults({
        basic_info: {
          email: data.data?.email || (isEmail ? emailOrUrl : ''),
          name: data.data?.full_name || ''
        },
        professional_info: {
          job_title: data.data?.work?.[0]?.title,
          location: data.data?.location?.name,
          linkedin_url: data.data?.linkedin_url || (!isEmail ? emailOrUrl : ''),
          photo_url: data.data?.photo_url,
          work: data.data?.work || [],
          education: data.data?.education || [],
          company: data.data?.work?.[0]?.company ? {
            name: data.data.work[0].company.name,
            industry: data.data.work[0].company.industry,
            size: data.data.work[0].company.size
          } : undefined,
          sources: ['LinkedIn', 'Email Analysis']
        },
        is_mock_data: data.data?.is_mock_data
      });
      
      // Display a warning if there's a message in the response
      if (data.message) {
        setError(`Note: ${data.message}`);
      }
      
      console.log("OSINT search results:", data);
    } catch (err: any) {
      console.error('OSINT search error:', err);
      setError(`Failed to retrieve OSINT data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const generateSocialProfiles = (fullName: string): SocialProfile[] => {
    const nameParts = fullName.trim().split(/\s+/);
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
    const profiles: SocialProfile[] = [];
    
    // GitHub
    profiles.push({
      platform: "GitHub",
      url: `https://github.com/${usernameFormats[0]}`,
      handle: usernameFormats[0],
    });
    
    // LinkedIn
    profiles.push({
      platform: "LinkedIn",
      url: `https://www.linkedin.com/in/${usernameFormats[1]}`,
      handle: usernameFormats[1],
    });
    
    // Instagram
    profiles.push({
      platform: "Instagram",
      url: `https://www.instagram.com/${usernameFormats[2]}`,
      handle: usernameFormats[2],
    });
    
    // Facebook
    profiles.push({
      platform: "Facebook",
      url: `https://www.facebook.com/${usernameFormats[0]}`,
      handle: usernameFormats[0],
    });
    
    // Twitter/X
    profiles.push({
      platform: "Twitter",
      url: `https://twitter.com/${usernameFormats[2]}`,
      handle: usernameFormats[2],
    });
    
    setSocialProfiles(profiles);
    return profiles;
  };

  const generateMockData = async (email: string): Promise<OsintResults> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate username from email
    const username = email.split('@')[0];
    const domain = email.split('@')[1];
    const nameParts = username.split(/[._-]/);
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    const lastName = nameParts.length > 1 ? (nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)) : 'Smith';
    const fullName = `${firstName} ${lastName}`;
    
    // Generate social profiles
    const socialProfiles: any[] = [
      {
        platform: "GitHub",
        url: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        handle: `${firstName.toLowerCase()}${lastName.toLowerCase()}`
      },
      {
        platform: "LinkedIn",
        url: `https://www.linkedin.com/in/${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        handle: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
      },
      {
        platform: "Twitter",
        url: `https://twitter.com/${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
        handle: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
      }
    ];
    
    // Mock work history
    const workHistory: WorkPosition[] = [
      {
        title: "Senior Software Engineer",
        company: {
          name: "Tech Innovations Inc",
          industry: "Information Technology",
          size: "501-1000 employees"
        },
        start_date: "2020-01",
        end_date: undefined,
        is_current: true
      },
      {
        title: "Software Developer",
        company: {
          name: "Digital Solutions Ltd",
          industry: "Software Development",
          size: "51-200 employees"
        },
        start_date: "2017-06",
        end_date: "2019-12",
        is_current: false
      }
    ];
    
    // Mock education
    const educationHistory: Education[] = [
      {
        school: {
          name: "University of Technology"
        },
        degree: "Master of Computer Science",
        start_date: "2015-09",
        end_date: "2017-05",
        is_current: false
      },
      {
        school: {
          name: "State College"
        },
        degree: "Bachelor of Science in Computer Engineering",
        start_date: "2011-09",
        end_date: "2015-05",
        is_current: false
      }
    ];
    
    return {
      basic_info: {
        email: email,
        name: fullName,
      },
      professional_info: {
        social_profiles: socialProfiles,
        sources: ['linkedin', 'github', 'company website', 'twitter'],
        domain: domain,
        job_title: "Senior Software Engineer",
        location: "San Francisco, CA",
        photo_url: null,
        connection_count: 500 + Math.floor(Math.random() * 500),
        last_updated: new Date().toISOString(),
        linkedin_url: `https://www.linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        work: workHistory,
        education: educationHistory,
        company: {
          name: "Tech Innovations Inc",
          website: `https://www.${domain}`,
          industry: "Information Technology",
          size: "501-1000 employees",
          location: "San Francisco, CA",
          description: "Tech Innovations Inc is a leading software development company specializing in cutting-edge solutions for enterprise clients. We focus on artificial intelligence, machine learning, and cloud computing technologies.",
          logo: null
        }
      },
      is_mock_data: true
    };
  };

  const renderTabContent = () => {
    if (!osintResults) return <div>No results available</div>;

    const { basic_info, professional_info } = osintResults;
    const companyInfo = professional_info?.company;
    const hasSocialProfiles = professional_info?.social_profiles && professional_info.social_profiles.length > 0;
    const hasCompanyInfo = !!companyInfo;
    const hasWorkHistory = professional_info?.work && professional_info.work.length > 0;
    const hasEducation = professional_info?.education && professional_info.education.length > 0;
    
    const email = studentEmail || basic_info?.email || '';
    const name = studentName || basic_info?.name || email.split('@')[0].replace(/[._-]/g, ' ');
    
    // Extract domain from email
    const domain = email.includes('@') ? email.split('@')[1] : '';
    
    // Social profiles section
    const linkedInProfile = professional_info?.social_profiles?.find(p => 
      p.platform.toLowerCase() === 'linkedin'
    );
    
    const linkedInUrl = linkedInProfile?.url || professional_info?.linkedin_url;
    
    // Warning message if using reconstructed data
    const showWarning = osintResults.is_mock_data === true || isMockData;

  return (
      <div className="space-y-6">
        {showWarning && (
          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-700 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div className="font-medium">Some data has been reconstructed</div>
            </div>
            <div className="mt-1 text-sm">
              We could not find complete information for this contact. Some details may be estimated based on available data.
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Person Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{name}</CardTitle>
                  <CardDescription className="text-teal-100 flex items-center mt-1">
                    {email ? (
                      <>
                        <AtSign className="h-3.5 w-3.5 mr-1" />
                        {email}
                      </>
                    ) : linkedInUrl && (
                      <>
                        <Linkedin className="h-3.5 w-3.5 mr-1" />
                        {linkedInUrl.split('/in/')[1]?.replace('/', '')}
                      </>
                    )}
                  </CardDescription>
        </div>
                
                {professional_info?.photo_url && (
                  <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-white">
                    <img 
                      src={professional_info.photo_url} 
                      alt={name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
            </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                {professional_info?.job_title && (
                  <div className="flex items-start">
                    <BusinessIcon className="h-5 w-5 mr-3 text-teal-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{professional_info.job_title}</div>
                      {professional_info?.company?.name && (
                        <div className="text-sm text-muted-foreground">
                          {professional_info.company.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {professional_info?.location && (
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 mr-3 text-teal-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-sm text-muted-foreground">
                        {professional_info.location}
                      </div>
                    </div>
                  </div>
                )}
                
                {linkedInUrl && (
                  <div className="flex items-start">
                    <Linkedin className="h-5 w-5 mr-3 text-teal-600 mt-0.5" />
                    <div>
                      <div className="font-medium">LinkedIn</div>
                      <a 
                        href={linkedInUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {linkedInUrl.replace('https://www.linkedin.com/in/', '@').replace('https://linkedin.com/in/', '@')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="bg-gray-50 border-t px-6 py-3">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-muted-foreground">
                  Last updated: {professional_info?.last_updated || 'Recently'}
                </div>
                
                {linkedInUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(linkedInUrl, '_blank')}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          
          {/* Data Sources Card */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                Information was gathered from the following sources
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {professional_info?.sources && professional_info.sources.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-40 relative">
                    <PieChart
                      data={professional_info.sources.map((source, index) => ({
                        title: source,
                        value: 1,
                        color: index === 0 ? '#0d9488' : 
                               index === 1 ? '#0891b2' : 
                               index === 2 ? '#2563eb' : 
                               `hsl(${index * 40}, 70%, 50%)`
                      }))}
                      lineWidth={40}
                      paddingAngle={2}
                      rounded
                      animate
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {professional_info.sources.map((source, index) => (
                      <Badge key={index} variant="outline" className="bg-white">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <SearchIcon className="h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p>No data sources available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Work History */}
        {hasWorkHistory && (
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>
                Professional history and positions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {professional_info?.work?.map((position: WorkPosition, index: number) => (
                  <div key={index} className={`rounded-lg border p-4 ${index > 0 ? 'border-dashed' : 'border-solid'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <BusinessIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{position.title}</h4>
                        <p className="text-sm text-muted-foreground">{position.company?.name}</p>
                        
                        {(position.start_date || position.is_current) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {position.start_date ? new Date(position.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Unknown'} - {position.is_current ? 'Present' : position.end_date ? new Date(position.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Unknown'}
                          </p>
                        )}
                        
                        {position.company?.industry && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                              {position.company.industry}
                            </Badge>
                            {position.company.size && (
                              <Badge variant="secondary" className="bg-gray-50 text-gray-700 hover:bg-gray-100">
                                {position.company.size} employees
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Education History */}
        {hasEducation && (
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>
                Academic background and qualifications
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {professional_info?.education?.map((education: Education, index: number) => (
                  <div key={index} className={`rounded-lg border p-4 ${index > 0 ? 'border-dashed' : 'border-solid'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{education.school?.name}</h4>
                        {education.degree && (
                          <p className="text-sm text-muted-foreground">{education.degree}</p>
                        )}
                        
                        {(education.start_date || education.is_current) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {education.start_date ? new Date(education.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Unknown'} - {education.is_current ? 'Present' : education.end_date ? new Date(education.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Unknown'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
            </CardContent>
          </Card>
        )}
        
        {/* Company Information */}
        {hasCompanyInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Details about {companyInfo?.name}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyInfo?.industry && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Industry</div>
                    <div>{companyInfo.industry}</div>
                  </div>
                )}
                
                {companyInfo?.size && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Company Size</div>
                    <div>{companyInfo.size}</div>
                  </div>
                )}
                
                {companyInfo?.location && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Headquarters</div>
                    <div>{companyInfo.location}</div>
                  </div>
                )}
                
                {companyInfo?.website && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Website</div>
                    <a 
                      href={companyInfo.website?.startsWith('http') ? 
                        companyInfo.website : 
                        `https://${companyInfo.website || ''}`
                      } 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {companyInfo.website?.replace(/^https?:\/\//, '') || companyInfo.name}
                    </a>
                  </div>
                )}
              </div>
              
              {companyInfo?.description && (
                <div className="mt-6 space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="text-sm leading-relaxed">
                    {companyInfo.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  const renderSocialTab = () => {
    const profiles = socialProfiles;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Social Profiles</CardTitle>
            <CardDescription>
              Potential social media accounts based on email/name patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profiles.map((profile, index) => {
                const Icon = profile.platform === "LinkedIn" ? Linkedin : profile.platform === "GitHub" ? Github : profile.platform === "Instagram" ? Instagram : profile.platform === "Facebook" ? Facebook : profile.platform === "Twitter" ? Twitter : Fingerprint;
                return (
                  <Card key={index} className="overflow-hidden border">
                    <div className={`${profile.platform === "LinkedIn" ? "bg-blue-600 dark:bg-blue-700" : profile.platform === "GitHub" ? "bg-slate-800 dark:bg-slate-700" : profile.platform === "Instagram" ? "bg-pink-600 dark:bg-pink-700" : profile.platform === "Facebook" ? "bg-blue-500 dark:bg-blue-600" : profile.platform === "Twitter" ? "bg-sky-500 dark:bg-sky-600" : "bg-teal-600 dark:bg-teal-700"} text-white p-4`}>
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6" />
                        <div>
                          <h4 className="font-medium">{profile.platform}</h4>
                          <p className="text-sm opacity-80">@{profile.handle}</p>
                        </div>
                      </div>
                    </div>
                    <CardFooter className="flex justify-between p-4 bg-white">
                      <Badge variant="outline" className="bg-white">
                        Potential Match
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="p-0 h-auto"
                        onClick={() => window.open(profile.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSearchSection = () => {
    // Track what type of input we're dealing with
    const isLinkInput = studentEmail.includes('linkedin.com') || linkedinUrl !== '';
    const inputValue = isLinkInput ? linkedinUrl : studentEmail;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>OSINT Dashboard</CardTitle>
          <CardDescription>
            Search for professional details with an email address or LinkedIn URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                {isLinkInput ? (
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                ) : (
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type="text"
                  value={inputValue}
                  onChange={e => {
                    const value = e.target.value;
                    if (value.includes('linkedin.com')) {
                      setLinkedinUrl(value);
                      setStudentEmail('');
                    } else {
                      setStudentEmail(value);
                      setLinkedinUrl('');
                    }
                  }}
                  placeholder={isLinkInput ? "Enter LinkedIn profile URL" : "Enter email address"}
                  className="pl-9"
                />
          </div>
              <Button 
                onClick={() => handleOsintSearch(inputValue)}
                disabled={loading || !inputValue}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={!isLinkInput ? "bg-teal-50 border-teal-200" : ""}
                onClick={() => {
                  setLinkedinUrl('');
                  setStudentEmail(studentEmail || 'example@gmail.com');
                }}
              >
                <AtSign className="h-3 w-3 mr-1" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={isLinkInput ? "bg-teal-50 border-teal-200" : ""}
                onClick={() => {
                  setStudentEmail('');
                  setLinkedinUrl(linkedinUrl || 'https://linkedin.com/in/username');
                }}
              >
                <Linkedin className="h-3 w-3 mr-1" />
                LinkedIn URL
              </Button>
            </div>
          </div>
        </CardContent>
        {error && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/50 pb-8">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-40 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">OSINT Intelligence</h1>
        <p className="text-muted-foreground">
          Find and analyze digital footprints with our advanced OSINT tools
        </p>
      </div>
      
      {renderSearchSection()}
      
      {osintResults && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="social">Social Profiles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {osintResults ? renderTabContent() : null}
          </TabsContent>
          
          <TabsContent value="social">
            {osintResults ? renderSocialTab() : null}
          </TabsContent>
        </Tabs>
      )}
      
      <BottomNav />
    </div>
  );
} 