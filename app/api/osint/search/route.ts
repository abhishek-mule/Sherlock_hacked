import { NextResponse } from 'next/server';
import axios from 'axios';

interface OSINTResult {
  basic_info?: {
    full_name?: string;
    email?: string;
    username?: string;
    location?: string;
    avatar_url?: string;
    name?: string;
  };
  professional_info?: {
    social_profiles?: {
      platform: string;
      username: string;
      url: string;
      bio?: string;
      followers?: number | null;
      profile_photo?: string | null;
      verified?: boolean;
    }[];
    sources?: string[];
    domain?: string;
    job_title?: string;
    location?: string;
    photo_url?: string | null;
    connection_count?: number | null;
    last_updated?: string;
    company?: {
      name: string;
      website: string;
      industry: string;
      size: string;
      location: string;
      description: string;
      logo: string | null;
    };
    linkedin?: {
      company_info: {
        name?: string;
        industry?: string;
        size?: string;
        location?: string;
        description?: string;
        logo?: string | null;
      }[];
      people_results: {
        name?: string;
        title?: string;
        company?: string;
        location?: string;
      }[];
    };
  };
  contact_info?: {
    email_addresses?: string[];
    social_handles?: {
      platform: string;
      handle: string;
    }[];
  };
  security_info?: {
    breached_accounts?: {
      site: string;
      breach_date: string;
      compromised_data: string[];
    }[];
  };
  is_mock_data?: boolean;
}

// Helper function to search for email on various services
async function searchEmailAcrossPlatforms(email: string): Promise<OSINTResult> {
  try {
    // Call the FastAPI backend for OSINT search
    try {
      const response = await fetch('http://localhost:8000/osint/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        // Add a shorter timeout to fail faster
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const backendData = await response.json();
        // Process backend data
        // ... existing backend data processing code
        
        // Extract domain from email
        const [username, domain] = email.split('@');
        
        // Enhanced professional information
        const companyInfo = {
          name: backendData.professional_info?.linkedin?.company_info?.[0]?.name || domain.split('.')[0],
          website: `https://${domain}`,
          industry: backendData.professional_info?.linkedin?.company_info?.[0]?.industry || "Unknown",
          size: backendData.professional_info?.linkedin?.company_info?.[0]?.size || "Unknown",
          location: backendData.professional_info?.linkedin?.company_info?.[0]?.location || "Unknown",
          description: backendData.professional_info?.linkedin?.company_info?.[0]?.description || "",
          logo: backendData.professional_info?.linkedin?.company_info?.[0]?.logo || null,
        };
        
        // Build enhanced information about the person
        const personInfo = {
          name: backendData.basic_info?.name || username.replace(/[.-_]/g, ' '),
          jobTitle: backendData.professional_info?.linkedin?.people_results?.[0]?.title || "Unknown",
          location: backendData.professional_info?.linkedin?.people_results?.[0]?.location || "Unknown",
          connectionCount: backendData.professional_info?.linkedin?.connection_count || null,
          photoUrl: backendData.professional_info?.linkedin?.profile_photo || null,
        };
        
        // Build the base result object with proper typing
        const results: OSINTResult = {
          basic_info: {
            email,
            username: username,
            name: personInfo.name
          },
          professional_info: {
            social_profiles: [],
            sources: backendData.professional_info?.sources || [],
            domain: backendData.professional_info?.domain || domain,
            job_title: personInfo.jobTitle,
            location: personInfo.location,
            photo_url: personInfo.photoUrl,
            connection_count: personInfo.connectionCount,
            last_updated: new Date().toISOString(),
            company: companyInfo,
            linkedin: {
              company_info: backendData.professional_info?.linkedin?.company_info || [],
              people_results: backendData.professional_info?.linkedin?.people_results || []
            }
          },
          contact_info: {
            email_addresses: [email],
            social_handles: []
          },
          security_info: {
            breached_accounts: backendData.security_info?.breached_accounts || []
          }
        };
        
        // Map social profiles from backend data if available
        if (backendData.professional_info?.social_profiles && results.professional_info) {
          results.professional_info.social_profiles = backendData.professional_info.social_profiles.map((profile: any) => ({
            platform: profile.platform,
            username: profile.username,
            url: profile.url,
            bio: `Profile found via ${email}`,
            followers: profile.followers || null,
            profile_photo: profile.profile_photo || null,
            verified: profile.verified || false
          }));
          
          // Add to social handles
          if (results.contact_info) {
            results.contact_info.social_handles = backendData.professional_info.social_profiles.map((profile: any) => ({
              platform: profile.platform,
              handle: profile.username
            }));
          }
        }
        
        return results;
      } else {
        // If FastAPI backend returns an error, fall back to mock data
        throw new Error('Backend returned an error');
      }
    } catch (fetchError) {
      console.warn('Backend connection failed, using mock data:', fetchError);
      // Fall back to mock data if backend is unreachable or returns an error
      return generateMockOsintData(email);
    }
  } catch (error) {
    console.error('Error in email search:', error);
    throw new Error('Failed to search email across platforms');
  }
}

// Generate mock OSINT data for when the backend is unreachable
function generateMockOsintData(email: string): OSINTResult {
  const [username, domain] = email.split('@');
  const companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  const personName = username.replace(/[.-_]/g, ' ').split(' ').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');

  // Mock platforms to check
  const platforms = [
    { name: 'GitHub', domain: 'github.com', likelihood: 0.7 },
    { name: 'LinkedIn', domain: 'linkedin.com', likelihood: 0.9 },
    { name: 'Twitter', domain: 'twitter.com', likelihood: 0.8 },
    { name: 'Facebook', domain: 'facebook.com', likelihood: 0.6 },
    { name: 'Instagram', domain: 'instagram.com', likelihood: 0.5 }
  ];

  // Generate mock company info
  const mockCompanyInfo = {
    name: companyName,
    website: `https://${domain}`,
    industry: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail'][Math.floor(Math.random() * 5)],
    size: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000'][Math.floor(Math.random() * 6)],
    location: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'][Math.floor(Math.random() * 5)],
    description: `${companyName} is a leading provider of innovative solutions.`,
    logo: null
  };

  // Create result object
  const result: OSINTResult = {
    basic_info: {
      email,
      username: username,
      name: personName
    },
    professional_info: {
      social_profiles: [],
      sources: ['linkedin', 'github', 'social-media'],
      domain: domain,
      job_title: ['Software Engineer', 'Product Manager', 'Marketing Specialist', 'Data Analyst', 'Designer'][Math.floor(Math.random() * 5)],
      location: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'][Math.floor(Math.random() * 5)],
      photo_url: null,
      connection_count: Math.floor(Math.random() * 500) + 100,
      last_updated: new Date().toISOString(),
      company: mockCompanyInfo,
      linkedin: {
        company_info: [{
          name: mockCompanyInfo.name,
          industry: mockCompanyInfo.industry,
          size: mockCompanyInfo.size,
          location: mockCompanyInfo.location,
          description: mockCompanyInfo.description,
          logo: null
        }],
        people_results: []
      }
    },
    contact_info: {
      email_addresses: [email],
      social_handles: []
    },
    security_info: {
      breached_accounts: []
    },
    is_mock_data: true
  };

  // Generate 3 related people
  const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'James Wilson'];
  const titles = ['Software Engineer', 'Product Manager', 'CEO', 'CTO', 'Marketing Director'];

  for (let i = 0; i < 3; i++) {
    if (result.professional_info?.linkedin?.people_results) {
      result.professional_info.linkedin.people_results.push({
        name: names[i % names.length],
        title: titles[i % titles.length],
        company: mockCompanyInfo.name,
        location: mockCompanyInfo.location
      });
    }
  }

  // Generate social profiles and handles based on platforms
  for (const platform of platforms) {
    // Simple mock logic: if domain matches platform or random chance exceeds threshold
    if (domain.includes(platform.domain.split('.')[0]) || Math.random() < platform.likelihood) {
      const socialProfile = {
        platform: platform.name,
        username: username,
        url: `https://${platform.domain}/${username}`,
        bio: `Profile found via ${email}`,
        followers: Math.floor(Math.random() * 1000),
        profile_photo: null,
        verified: Math.random() > 0.5
      };

      // Add to social profiles
      if (result.professional_info?.social_profiles) {
        result.professional_info.social_profiles.push(socialProfile);
      }

      // Add to social handles
      if (result.contact_info?.social_handles) {
        result.contact_info.social_handles.push({
          platform: platform.name,
          handle: username
        });
      }
    }
  }

  // Add breach data if random chance exceeds threshold
  if (Math.random() > 0.6 && result.security_info?.breached_accounts) {
    const breachSites = ['Adobe', 'LinkedIn', 'Dropbox', 'MyFitnessPal', 'Canva'];
    const randomSite = breachSites[Math.floor(Math.random() * breachSites.length)];
    const randomYear = 2015 + Math.floor(Math.random() * 8);
    
    result.security_info.breached_accounts.push({
      site: randomSite,
      breach_date: `${randomYear}-${Math.floor(Math.random() * 12) + 1}`,
      compromised_data: [
        'Email addresses', 
        'Passwords', 
        'Usernames', 
        'IP addresses'
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    });
  }

  return result;
}

// Main handler function
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log(`Processing OSINT search for email: ${email}`);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Perform email-based search
    const osintResults = await searchEmailAcrossPlatforms(email);
    
    // Log success and return results
    console.log(`Successfully completed OSINT search for ${email}`);
    return NextResponse.json(osintResults);
    
  } catch (error: any) {
    console.error('OSINT search API error:', error);
    return NextResponse.json(
      { error: `OSINT search failed: ${error.message}` },
      { status: 500 }
    );
  }
} 