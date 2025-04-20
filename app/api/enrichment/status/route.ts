import { NextResponse } from 'next/server';

export async function GET() {
  // Check if API key is configured
  const apiKey = process.env.REVERSECONTACT_API_KEY || 'sk_db8a53e6a46f64e31c6d764a96d56ac546afa237';
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API key is not configured. Please add REVERSECONTACT_API_KEY to your environment variables.'
    });
  }
  
  try {
    // Try to make a test call to the API with a known email
    const testEmail = 'test@example.com';
    const apiUrl = "https://api.reversecontact.com/enrichment";
    const requestParams = new URLSearchParams({ email: testEmail });
    
    // Try with X-API-KEY header
    try {
      const response = await fetch(`${apiUrl}?${requestParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: 'API is configured correctly with X-API-KEY header.',
          headerType: 'X-API-KEY'
        });
      }
      
      // Check for "No more credits" error - this means the API key is valid but out of credits
      const errorText = await response.text();
      console.log(`X-API-KEY auth response: ${response.status}: ${errorText}`);
      
      // Check if the error is about credits
      if (response.status === 402 && errorText.includes("No more credits")) {
        return NextResponse.json({
          success: true, // Still return success as the API is configured correctly
          message: 'API key is valid but your account has no more credits. Please purchase more credits or use mock data.',
          needsCredits: true,
          headerType: 'X-API-KEY'
        });
      }
      
      // Try with Authorization header
      const authResponse = await fetch(`${apiUrl}?${requestParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (authResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'API is configured correctly with Authorization header.',
          headerType: 'Authorization'
        });
      }
      
      // Check for "No more credits" error with Authorization header
      const authErrorText = await authResponse.text();
      if (authResponse.status === 402 && authErrorText.includes("No more credits")) {
        return NextResponse.json({
          success: true, // Still return success as the API is configured correctly
          message: 'API key is valid but your account has no more credits. Please purchase more credits or use mock data.',
          needsCredits: true,
          headerType: 'Authorization'
        });
      }
      
      // Try with Bearer token
      const bearerResponse = await fetch(`${apiUrl}?${requestParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (bearerResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'API is configured correctly with Bearer token.',
          headerType: 'Bearer'
        });
      }
      
      // Check for "No more credits" error with Bearer token
      const bearerErrorText = await bearerResponse.text();
      if (bearerResponse.status === 402 && bearerErrorText.includes("No more credits")) {
        return NextResponse.json({
          success: true, // Still return success as the API is configured correctly
          message: 'API key is valid but your account has no more credits. Please purchase more credits or use mock data.',
          needsCredits: true,
          headerType: 'Bearer'
        });
      }
      
      // All authentication methods failed
      const authError = await authResponse.text();
      const bearerError = await bearerResponse.text();
      
      return NextResponse.json({
        success: false,
        error: `API authentication failed. Status codes: X-API-KEY (${response.status}), Auth (${authResponse.status}), Bearer (${bearerResponse.status})`,
        details: {
          xApiKeyError: errorText,
          authError,
          bearerError
        }
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
} 