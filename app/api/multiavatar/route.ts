import { NextResponse } from 'next/server';
import { generateAvatar, svgToDataUrl } from '@/lib/avatar-utils';

/**
 * API route for generating avatars using the local Multiavatar library
 * This provides SVG avatars without relying on external services
 */
export async function GET(request: Request) {
  // Extract params
  const { searchParams } = new URL(request.url);
  const seed = searchParams.get('seed') || '';
  const sansEnv = searchParams.get('sansEnv') === 'true';
  const format = searchParams.get('format') || 'json';
  
  try {
    // Generate a stable seed from user inputs or use provided seed directly
    const avatarSeed = seed || Math.random().toString(36).substring(2, 12);
    
    // Generate the avatar SVG using the Multiavatar library
    const svgCode = generateAvatar(avatarSeed, sansEnv);
    
    if (!svgCode) {
      throw new Error('Failed to generate avatar');
    }
    
    // If format is 'svg', return the SVG directly
    if (format === 'svg') {
      return new NextResponse(svgCode, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }
    
    // Otherwise return the JSON response with SVG and data URL
    const dataUrl = svgToDataUrl(svgCode);
    
    return NextResponse.json({
      svg: svgCode,
      dataUrl: dataUrl,
      seed: avatarSeed,
      success: true
    });
  } catch (error) {
    console.error('Error generating Multiavatar:', error);
    
    // Fallback to UI Avatars if there's any issue
    const fallbackSeed = seed || Math.random().toString(36).substring(2, 10);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackSeed)}&background=random&color=fff&size=100&format=png`;
    
    return NextResponse.json({
      imageUrl: fallbackUrl,
      seed: fallbackSeed,
      fallback: true,
      error: 'Failed to generate avatar'
    });
  }
} 