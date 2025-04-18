import { NextResponse } from 'next/server';

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
    const apiKey = process.env.REVERSECONTACT_API_KEY;
    
    if (!apiKey) {
      console.error('REVERSECONTACT_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Make request to ReverseContact API
    const response = await fetch(`https://api.reversecontact.com/enrichment?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      return NextResponse.json(
        { error: `Error from external API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in lookup API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 