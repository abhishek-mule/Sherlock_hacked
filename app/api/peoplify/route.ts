import { NextResponse } from 'next/server';

/**
 * Proxy API route for the Peoplify avatar API
 * Allows us to generate avatars server-side rather than client-side
 */
export async function GET(request: Request) {
  // Extract params early so they're available throughout the function
  const { searchParams } = new URL(request.url);
  const seed = searchParams.get('seed') || '';
  const gender = searchParams.get('gender') || (Math.random() > 0.5 ? 'Male' : 'Female');
  const size = searchParams.get('size') || '200';
  
  try {
    // Build the Peoplify API URL with parameters
    const params = new URLSearchParams();
    
    // Add required parameters
    if (size) params.append('size', size);
    if (gender) params.append('gender', gender);
    
    // Use seed parameter if provided
    if (seed) {
      // Use the seed value for deterministic avatar generation
      params.append('seed', seed);
    }
    
    // Get a deterministic number from the seed for consistent randomization
    const seedHash = seed ? Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 1000);
    
    // Add avatarType (body or head)
    const avatarTypes = ['Body', 'Head'];
    params.append('avatarType', avatarTypes[seedHash % avatarTypes.length]);
    
    // Add body color from the accepted values
    const bodyColors = ['Yellow', 'Black', 'Brown', 'White', 'Pink', 'Nude'];
    params.append('bodyColor', bodyColors[seedHash % bodyColors.length]);
    
    // Add face type
    const faceTypes = ['NORMAL', 'FRECKLES'];
    params.append('faceType', faceTypes[seedHash % faceTypes.length]);
    
    // Add hair type based on gender
    // Hair types according to the documentation
    const maleHairTypes = ['SEMI_BALD', 'SHORT_AFRO', 'CENTER_PART', 'SIDE_PART', 'CORNROWS', 'BALD'];
    const femaleHairTypes = ['LONG_AFRO', 'PONY_TAIL'];
    
    if (gender === 'Male') {
      const hairTypeIndex = seedHash % maleHairTypes.length;
      params.append('hairType', maleHairTypes[hairTypeIndex]);
    } else {
      const hairTypeIndex = seedHash % femaleHairTypes.length;
      params.append('hairType', femaleHairTypes[hairTypeIndex]);
    }
    
    // Add hair color
    const hairColors = ['BLACK', 'BLONDE', 'BLUE', 'BROWN', 'ORANGE', 'PINK', 'WHITE'];
    params.append('hairColor', hairColors[seedHash % hairColors.length]);
    
    // Add beard for males (based on seed)
    if (gender === 'Male' && seedHash % 3 === 0) {
      const beardTypes = ['GOAT_PATCH', 'GOATEE', 'FORK', 'CHIN_TRAP', 'GARIBALDI', 'NED_KELLY'];
      params.append('beardType', beardTypes[seedHash % beardTypes.length]);
      params.append('beardColor', hairColors[seedHash % hairColors.length]);
    }
    
    // Add mustache (based on seed)
    if (gender === 'Male' && seedHash % 4 === 0) {
      const mustacheTypes = ['CHEVRON', 'WALRUS', 'HANDLEBAR', 'POIROT'];
      params.append('mustacheType', mustacheTypes[seedHash % mustacheTypes.length]);
      params.append('mustacheColor', hairColors[seedHash % hairColors.length]);
    }
    
    // Add clothing color
    const clothColors = ['BLACK', 'BLUE', 'GRAY', 'GREEN', 'ORANGE', 'PINK', 'PURPLE', 'RED', 'WHITE', 'YELLOW'];
    params.append('clothColor', clothColors[seedHash % clothColors.length]);
    
    // Add glasses (based on seed)
    if (seedHash % 4 === 0) {
      const glassesTypes = ['ROUND', 'CAT_EYE'];
      params.append('glassesType', glassesTypes[seedHash % glassesTypes.length]);
      params.append('glassesColor', clothColors[seedHash % clothColors.length]);
    }
    
    // Construct the Peoplify API URL
    const peoplifyUrl = `https://peoplify.pics/api/generate/avatar?${params.toString()}`;
    console.log(`Calling Peoplify API: ${peoplifyUrl}`);
    
    try {
      const response = await fetch(peoplifyUrl, { 
        headers: { 'Accept': 'application/json' },
        cache: 'force-cache', // Cache the response
        next: { revalidate: 86400 } // Cache for 24 hours
      });
      
      if (response.ok) {
        const data = await response.json();
        // Make sure the data includes an imageUrl property
        if (!data.imageUrl && data.url) {
          data.imageUrl = data.url;
        }
        return NextResponse.json(data);
      } else {
        console.error(`Peoplify API returned status ${response.status}`);
        throw new Error(`Peoplify API returned status ${response.status}`);
      }
    } catch (fetchError) {
      console.error('Error fetching from Peoplify:', fetchError);
      
      // If Peoplify API fails, use Dicebear API as a fallback
      const styles = ['micah', 'adventurer', 'avataaars', 'bottts', 'fun-emoji'];
      const styleSeed = seedHash % styles.length;
      const dicebearUrl = `https://avatars.dicebear.com/api/${styles[styleSeed]}/${seed || seedHash}.svg?size=${size}`;
      
      return NextResponse.json({
        imageUrl: dicebearUrl,
        fallback: true,
        message: 'Using fallback avatar service (DiceBear)'
      });
    }
  } catch (error) {
    console.error('Avatar generation error:', error);
    // Return a basic fallback even in case of errors
    const fallbackSeed = seed || Math.random().toString(36).substring(2, 10);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackSeed)}&background=random&color=fff&size=${size || 200}&format=png`;
    
    return NextResponse.json({
      imageUrl: fallbackUrl,
      fallback: true,
      error: 'Failed to generate avatar'
    });
  }
}

/**
 * Generate a random name using the Peoplify name API
 */
export async function POST(request: Request) {
  try {
    const { gender } = await request.json();
    
    const params = new URLSearchParams();
    if (gender) {
      params.append('gender', gender);
    }
    
    // Add language parameter
    params.append('language', 'English');
    
    // Use the Peoplify API for names
    const peoplifyUrl = `https://peoplify.pics/api/generate/name?${params.toString()}`;
    
    try {
      const response = await fetch(peoplifyUrl, { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store' // Don't cache names to get variety
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        throw new Error(`Peoplify API returned status ${response.status}`);
      }
    } catch (fetchError) {
      console.error('Error fetching name from Peoplify:', fetchError);
      
      // Generate fallback name
      const firstNames = gender === 'Female' 
        ? ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia']
        : ['Liam', 'Noah', 'Oliver', 'William', 'Elijah', 'James', 'Benjamin', 'Lucas'];
        
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      return NextResponse.json({
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        gender: gender || 'Unknown',
        fallback: true
      });
    }
  } catch (error) {
    console.error('Name generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate name' },
      { status: 500 }
    );
  }
} 