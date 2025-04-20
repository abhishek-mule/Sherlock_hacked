import { NextResponse } from 'next/server';

const PEOPLIFY_API_URL = 'https://api.peoplify.ai/generate/avatar';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract params with defaults
    const gender = searchParams.get('gender') || 'random';
    const hairType = searchParams.get('hairType') || 'random';
    const hairColor = searchParams.get('hairColor') || 'random';
    const glasses = searchParams.get('glasses') || 'false';
    const beard = searchParams.get('beard') || 'false';
    
    // Mock the Peoplify API response since we don't have a real API
    // In a real implementation, this would be a fetch call to the Peoplify API
    
    // Create a deterministic but random-looking seed based on parameters
    const seed = `${gender}-${hairType}-${hairColor}-${glasses}-${beard}-${Date.now()}`;
    const randomNum = Math.abs(
      seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000
    );
    
    // Use DiceBear as a reliable alternative
    let style = 'micah'; // Default style that supports gender-based avatars
    
    // Generate different styles based on parameters
    if (gender === 'male') {
      style = Math.random() > 0.5 ? 'avataaars' : 'micah';
    } else if (gender === 'female') {
      style = Math.random() > 0.5 ? 'avataaars' : 'micah';
    } else {
      style = ['bottts', 'avataaars', 'micah', 'open-peeps'][Math.floor(Math.random() * 4)];
    }
    
    // Add randomness to the generated avatars
    const randomSeed = `${seed}-${randomNum}`;
    const imageUrl = `https://avatars.dicebear.com/api/${style}/${randomSeed}.svg`;
    
    // Return the mock response
    return NextResponse.json({
      imageUrl,
      params: {
        gender,
        hairType,
        hairColor,
        glasses: glasses === 'true',
        beard: beard === 'true'
      }
    });
    
  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar' },
      { status: 500 }
    );
  }
} 