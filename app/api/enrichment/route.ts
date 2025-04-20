import { NextResponse } from 'next/server';

// Function to generate mock data when API is unavailable
function generateMockEnrichmentData(email: string) {
  const [username, domain] = email.split('@');
  const name = username.replace(/[._-]/g, ' ').split(' ').map(
    word => word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  // Add some randomness to make mock data more varied
  const randomId = Math.floor(Math.random() * 1000000).toString();
  const followerCount = Math.floor(Math.random() * 5000) + 100;
  const isOpenToWork = Math.random() > 0.8; // 20% chance of being open to work
  
  // Generate more realistic mock data based on the example response format
  return {
    success: true,
      email: email,
    emailType: Math.random() > 0.5 ? 'professional' : 'personal',
    credits_left: 90000,
    rate_limit_left: 19000,
    person: {
      publicIdentifier: username.toLowerCase().replace(/[._]/g, ''),
      memberIdentifier: randomId,
      linkedInIdentifier: `ACoAAA${randomId}`,
      linkedInUrl: `https://linkedin.com/in/${username.toLowerCase().replace(/[._]/g, '')}`,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').length > 1 ? name.split(' ')[1] : '',
      headline: `Software Engineer at ${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)}`,
      location: 'Seattle, Washington, United States',
      summary: `Experienced software professional with expertise in ${domain.split('.')[0]} technologies.`,
      photoUrl: `https://i.pravatar.cc/300?u=${email}`,
      backgroundUrl: `https://picsum.photos/800/200?random=${randomId}`,
      openToWork: isOpenToWork,
      premium: Math.random() > 0.7,
      followerCount: followerCount,
      positions: {
        positionsCount: 2,
        positionHistory: [
          {
            title: 'Senior Software Engineer',
            companyName: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
            description: 'Leading development of core platform features',
            startEndDate: {
              start: { month: 1, year: 2020 },
              end: null
            },
            companyLogo: `https://logo.clearbit.com/${domain}`,
            linkedInUrl: `https://linkedin.com/company/${domain.split('.')[0].toLowerCase()}`,
            linkedInId: (Math.floor(Math.random() * 100000) + 1000).toString()
          },
          {
          title: 'Software Engineer',
            companyName: 'Previous Company Inc',
            description: 'Full-stack development and API integration',
            startEndDate: {
              start: { month: 3, year: 2017 },
              end: { month: 12, year: 2019 }
            }
          }
        ]
      },
      schools: {
        educationsCount: 1,
        educationHistory: [
          {
            schoolName: 'University of Technology',
            degreeName: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startEndDate: {
              start: { year: 2013 },
              end: { year: 2017 }
            },
            schoolLogo: 'https://i.pravatar.cc/100?img=7',
            linkedInUrl: 'https://linkedin.com/school/university-of-technology'
          }
        ]
      },
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Next.js'],
      languages: ['English', 'Spanish']
    },
    company: {
      linkedInId: (Math.floor(Math.random() * 10000) + 1000).toString(),
      name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
      universalName: domain.split('.')[0].toLowerCase(),
      linkedInUrl: `https://linkedin.com/company/${domain.split('.')[0].toLowerCase()}`,
      employeeCount: Math.floor(Math.random() * 5000) + 50,
      employeeCountRange: {
        start: 10,
        end: 10000
      },
      websiteUrl: `https://${domain}`,
      tagline: `Innovative solutions for tomorrow's challenges`,
      industry: 'Software Development',
      logo: `https://logo.clearbit.com/${domain}`,
      description: `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} is a leading technology company in its field. We specialize in developing cutting-edge software solutions for businesses around the world.`,
      followerCount: Math.floor(Math.random() * 500000) + 10000,
      specialities: [
        'Software Development',
        'Cloud Computing',
        'Artificial Intelligence',
        'Machine Learning',
        'Web Development',
        'Mobile Applications'
      ],
      headquarter: {
        city: 'San Francisco',
        geographicArea: 'California',
        country: 'US',
        postalCode: '94105',
        street1: '123 Tech Avenue',
        street2: null
      }
    },
    _source: 'mock_data',
      is_mock_data: true
  };
}

export async function GET(request: Request) {
  // Get the email query parameter
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  // Validate email
  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    );
  }

  // Email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  try {
    // Get API key from environment variables
    const apiKey = process.env.REVERSECONTACT_API_KEY || 'sk_db8a53e6a46f64e31c6d764a96d56ac546afa237';
    
    if (!apiKey) {
      console.error('REVERSECONTACT_API_KEY not found in environment variables');
      // Return mock data instead of error for demo purposes
      const mockData = generateMockEnrichmentData(email);
      return NextResponse.json({
        ...mockData,
        _api_message: 'API key not configured. Using mock data.'
      });
    }

    // Use ReverseContact API for enrichment
    console.log('Using ReverseContact API for enrichment...');
    console.log(`Using API key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);

    // Call the ReverseContact API with the proper parameters
    const apiUrl = "https://api.reversecontact.com/enrichment";
    const requestParams = new URLSearchParams({
      email: email,
    });

    try {
      // Set a reasonable timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const fullUrl = `${apiUrl}?${requestParams.toString()}`;
      console.log(`Requesting: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          // Properly format the Authorization header with the API key
          'X-API-KEY': apiKey, // Try this format
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log(`API Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ReverseContact API Error:', response.status, errorText);
        
        // Try with a different auth format
        const retryResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
            'Authorization': apiKey, // Try without Bearer prefix
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

        // If retry succeeds, use it
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log(`Successfully enriched data for email: ${email} using ReverseContact API (retry)`);
          data._source = 'reversecontact_api';
          return NextResponse.json(data);
        }
        
        // If the API fails after retry, fall back to mock data
        console.log('Falling back to mock data generation after retry');
        const mockData = generateMockEnrichmentData(email);
        return NextResponse.json({
          ...mockData,
          _api_error: `ReverseContact API returned status ${response.status}. Error: ${errorText}`
        });
    }

    const data = await response.json();
      console.log(`Successfully enriched data for email: ${email} using ReverseContact API`);
    
    // Add a flag to indicate this is real data, not mock
      data._source = 'reversecontact_api';
      
      // If there's no person or company data but the API call was successful,
      // this likely means the email wasn't found in their database
      if ((!data.person || Object.keys(data.person).length === 0) && 
          (!data.company || Object.keys(data.company).length === 0) && 
          data.success) {
        console.log('API returned success but no data. Using mock data');
        const mockData = generateMockEnrichmentData(email);
        return NextResponse.json({
          ...mockData,
          _api_message: 'No data found for this email in the ReverseContact database'
        });
      }
    
    return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const mockData = generateMockEnrichmentData(email);
        return NextResponse.json({
          ...mockData,
          _api_error: 'API request timed out after 30 seconds'
        });
      }
      throw fetchError; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error in enrichment API route:', error);
    
    // In case of any error, fall back to mock data
    console.log('Falling back to mock data due to exception');
    const mockData = generateMockEnrichmentData(email);
    return NextResponse.json({
      ...mockData,
      _error_message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 