import { NextResponse } from 'next/server';

interface EnrichmentResult {
  status: number;
  likelihood?: number;
  data?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    gender?: string;
    birth_date?: string | null;
    birth_year?: number | null;
    linkedin_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    github_url?: string;
    work?: {
      company: {
        name: string;
        size?: string;
        industry?: string;
      };
      title?: string;
      start_date?: string;
      end_date?: string | null;
      is_current?: boolean;
    }[];
    education?: {
      school: {
        name: string;
        type?: string;
      };
      degree?: string;
      start_date?: string;
      end_date?: string;
      is_current?: boolean;
    }[];
    location?: {
      name?: string;
      country?: string;
      region?: string;
      city?: string;
      postal_code?: string | null;
    };
    skills?: string[];
    is_mock_data?: boolean;
  };
  error?: string;
  message?: string;
}

// Function to extract LinkedIn profile based on email
async function findLinkedInProfile(email: string): Promise<string | null> {
  try {
    // Extract username from email for better search
    const [username] = email.split('@');
    
    // For demo purposes, generate a likely LinkedIn username
    const linkedinUsername = username.replace(/[._]/g, '-');
    const linkedinUrl = `https://linkedin.com/in/${linkedinUsername}`;
    
    console.log(`Generated LinkedIn URL for lookup: ${linkedinUrl}`);
    return linkedinUrl;
  } catch (error) {
    console.error('Error finding LinkedIn profile:', error);
    return null;
  }
}

// Function to convert ReverseContact API response to our internal format
function convertReverseContactDataToInternalFormat(data: any): EnrichmentResult {
  const { person, company } = data;
  
  const positions = person?.positions?.positionHistory || [];
  const education = person?.schools?.educationHistory || [];
  
  return {
    status: 200,
    likelihood: 0.95,
    data: {
      full_name: `${person.firstName} ${person.lastName}`,
      first_name: person.firstName,
      last_name: person.lastName,
      linkedin_url: person.linkedInUrl,
      location: {
        name: person.location
      },
      skills: person.skills || [],
      work: positions.map((position: any) => ({
        company: {
          name: position.companyName,
          industry: company?.industry || 'Unknown',
          size: company?.employeeCountRange ? 
            `${company.employeeCountRange.start}-${company.employeeCountRange.end === 1 ? '+' : company.employeeCountRange.end}` : 
            'Unknown'
        },
        title: position.title,
        start_date: position.startEndDate.start ? 
          `${position.startEndDate.start.year}-${position.startEndDate.start.month || '01'}` : 
          undefined,
        end_date: position.startEndDate.end ? 
          `${position.startEndDate.end.year}-${position.startEndDate.end.month || '01'}` : 
          null,
        is_current: position.startEndDate.end === null
      })),
      education: education.map((edu: any) => ({
        school: {
          name: edu.schoolName,
          type: 'college'
        },
        degree: edu.degreeName || 'Unknown Degree',
        start_date: edu.startEndDate.start?.year ? 
          `${edu.startEndDate.start.year}-${edu.startEndDate.start.month || '01'}` : 
          undefined,
        end_date: edu.startEndDate.end?.year ? 
          `${edu.startEndDate.end.year}-${edu.startEndDate.end.month || '01'}` : 
          undefined,
        is_current: edu.startEndDate.end === null
      })),
      is_mock_data: false
    }
  };
}

// Function to generate mock LinkedIn data
function generateMockLinkedInData(profileUrl: string): EnrichmentResult {
  // Extract username from LinkedIn URL
  const username = profileUrl.split('/in/')[1]?.replace('/', '') || 'user';
  
  // Generate a plausible name from the username
  const nameParts = username.split(/[-_.]/);
  const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
  const lastName = nameParts.length > 1 
    ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
    : 'Professional';
  
  return {
    status: 200,
    likelihood: 0.7,
    data: {
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      linkedin_url: profileUrl,
      location: {
        name: 'San Francisco, California'
      },
      work: [
        {
          company: {
            name: 'Tech Innovations Inc',
            industry: 'Information Technology',
            size: '501-1000'
          },
          title: 'Senior Software Engineer',
          start_date: '2020-01',
          end_date: null,
          is_current: true
        },
        {
          company: {
            name: 'Digital Solutions Ltd',
            industry: 'Software Development',
            size: '51-200'
          },
          title: 'Software Developer',
          start_date: '2017-06',
          end_date: '2019-12',
          is_current: false
        }
      ],
      education: [
        {
          school: {
            name: 'University of Technology',
            type: 'college'
          },
          degree: 'Master of Computer Science',
          start_date: '2015-09',
          end_date: '2017-05',
          is_current: false
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Cloud Computing'],
      is_mock_data: true
    }
  };
}

// Function to generate mock email-based data
function generateMockEmailData(email: string): EnrichmentResult {
  // Extract username and domain from email
  const [username, domain] = email.split('@');
  
  // Generate a plausible name from the username
  const nameParts = username.split(/[._-]/);
  const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
  const lastName = nameParts.length > 1 
    ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
    : 'User';
  
  // Generate a plausible LinkedIn URL
  const linkedinUsername = username.replace(/[._]/g, '-');
  const linkedinUrl = `https://linkedin.com/in/${linkedinUsername}`;
  
  const domainName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  const isEducational = domain.includes('edu');
  
  return {
    status: 200,
    likelihood: 0.6,
    data: {
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email: email,
      linkedin_url: linkedinUrl,
      github_url: `https://github.com/${username}`,
      twitter_url: `https://twitter.com/${username}`,
      work: isEducational ? [] : [
        {
          company: {
            name: isEducational ? 'University' : domainName,
            industry: isEducational ? 'Education' : 'Technology'
          },
          title: isEducational ? 'Student' : 'Professional',
          is_current: true
        }
      ],
      education: isEducational ? [
        {
          school: {
            name: domainName,
            type: 'college'
          },
          degree: 'Degree Program',
          is_current: true
        }
      ] : [],
      location: {
        name: 'California, United States',
        country: domain.endsWith('.in') ? 'India' : domain.endsWith('.uk') ? 'United Kingdom' : 'United States',
        region: domain.endsWith('.in') ? 'Maharashtra' : domain.endsWith('.uk') ? 'London' : 'California'
      },
      skills: isEducational ? ['Research', 'Data Analysis', 'Academic Writing'] : ['Programming', 'Project Management', 'Communication'],
      is_mock_data: true
    },
    message: "Using generated data based on email patterns. No external API call was made."
  };
}

// Function to validate the API key format
function isValidApiKey(apiKey: string | null | undefined): boolean {
  // Basic validation - ReverseContact API keys typically start with "sk_" and are 48 chars
  return typeof apiKey === 'string' && apiKey.startsWith('sk_') && apiKey.length >= 40;
}

export async function GET(request: Request) {
  // Get the email or LinkedIn URL query parameter
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const linkedinUrl = searchParams.get('linkedin_url');

  // Validate we have at least one parameter
  if (!email && !linkedinUrl) {
    return NextResponse.json(
      { error: 'Either email or linkedin_url parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get API key from environment variables or use the provided one
    const apiKey = process.env.REVERSE_CONTACT_API_KEY || 'sk_db8a53e6a46f64e31c6d764a96d56ac546afa237';
    
    // Validate API key
    if (!apiKey) {
      console.error('REVERSE_CONTACT_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API configuration error - Missing API key' },
        { status: 500 }
      );
    }
    
    // Validate API key format
    if (!isValidApiKey(apiKey)) {
      console.error('REVERSE_CONTACT_API_KEY has invalid format');
      return NextResponse.json(
        { error: 'API configuration error - Invalid API key format' },
        { status: 500 }
      );
    }

    // If we have a LinkedIn URL, use it directly
    let profileUrl = linkedinUrl;
    
    // If we don't have a LinkedIn URL but have an email, try to find the profile
    if (!profileUrl && email) {
      try {
        // First try to get LinkedIn URL from email
        const url = await findLinkedInProfile(email);
        if (url) {
          profileUrl = url;
          console.log(`Found LinkedIn profile URL for ${email}: ${profileUrl}`);
        }
      } catch (profileLookupError) {
        console.warn('Error looking up LinkedIn profile from email:', profileLookupError);
      }
    }

    // If we have a LinkedIn profile URL, use the ReverseContact API
    if (profileUrl) {
      try {
        // Construct the URL with query parameters
        const reverseContactApiUrl = "https://api.reversecontact.com/enrichment/profile";
        
        console.log(`Calling ReverseContact API with URL: ${profileUrl}`);
        
        // According to documentation, we need to add the URL as a query parameter
        const apiUrlWithParams = `${reverseContactApiUrl}?url=${encodeURIComponent(profileUrl)}`;
        
        console.log(`Full API URL: ${apiUrlWithParams}`);
        console.log(`Using API key: ${apiKey.substring(0, 10)}...`);
        
        const response = await fetch(apiUrlWithParams, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`ReverseContact API returned error: ${response.status} - ${errorText}`);
          
          // If the API call fails due to authentication issues, use a mock/fallback response instead
          if (response.status === 401 || response.status === 403) {
            console.log("Using fallback mock data due to authentication issues");
            const mockData = generateMockLinkedInData(profileUrl);
            
            // Add a message to indicate this is mock data due to API issues
            if (mockData.data) {
              mockData.data.is_mock_data = true;
            }
            mockData.status = 200;
            mockData.message = "API key authentication failed. Using generated data instead. Please check your Reverse Contact API key configuration.";
            
            return NextResponse.json(mockData);
          }
          
          throw new Error(`ReverseContact API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`Successfully retrieved data for LinkedIn profile: ${profileUrl}`);
          
          // Convert the API response to our internal format
          const enrichedData = convertReverseContactDataToInternalFormat(data);
          
          // Add the original email if it was provided
          if (email && enrichedData.data) {
            enrichedData.data.email = email;
          }
          
          return NextResponse.json(enrichedData);
        } else {
          console.warn("ReverseContact API returned unsuccessful response:", data);
          // Fall back to mock data
          console.log("Using fallback mock data due to error");
          const mockData = generateMockLinkedInData(profileUrl);
          
          // Add a message for the user
          if (mockData.data) {
            mockData.data.is_mock_data = true;
          }
          mockData.status = 200;
          mockData.message = "An error occurred with the external API. Using generated data instead. Details: " + (data instanceof Error ? data.message : "Unknown error");
          
          return NextResponse.json(mockData);
        }
      } catch (apiError) {
        console.error('Error calling ReverseContact API:', apiError);
        // Fall back to mock data
        console.log("Using fallback mock data due to error");
        const mockData = generateMockLinkedInData(profileUrl);
        
        // Add a message for the user
        if (mockData.data) {
          mockData.data.is_mock_data = true;
        }
        mockData.status = 200;
        mockData.message = "An error occurred with the external API. Using generated data instead. Details: " + (apiError instanceof Error ? apiError.message : "Unknown error");
        
        return NextResponse.json(mockData);
      }
    }

    // If all attempts have failed, try a basic email-based lookup as fallback
    if (email) {
      try {
        console.log(`Using email-based lookup for: ${email}`);
        // Use the enhanced mock data generator
        const mockData = generateMockEmailData(email);
        
        // Add a message about using mock data
        mockData.message = "Using generated data based on email patterns. No external API call was made.";
        
        return NextResponse.json(mockData);
      } catch (emailError) {
        console.error('Error in email-based fallback:', emailError);
        // Create a very basic response if all else fails
        return NextResponse.json({
          status: 200,
          likelihood: 0.5,
          data: {
            email: email,
            is_mock_data: true
          }
        });
      }
    }

    // If we get here, we couldn't process the request
    return NextResponse.json(
      { 
        status: 400,
        error: 'Could not process request with provided parameters'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in enrichment API route:', error);
    
    // Return a basic error response
    return NextResponse.json(
      { 
        status: 500,
        error: 'Failed to enrich data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 