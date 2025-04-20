import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate parameters for Peoplify API avatar based on a seed
 * @param seed - String to use as seed for consistent avatar generation
 * @returns Object with seed and gender parameters for Peoplify API
 */
export function generatePeoplifyAvatarParams(seed: string) {
  // Generate a consistent hash from the seed
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Get gender (randomly but consistently assigned based on seed)
  const gender = hash % 2 === 0 ? 'Male' : 'Female';
  
  // Return seed and gender for Peoplify API
  return {
    seed: seed,
    gender: gender
  };
}

/**
 * Generate a fallback avatar URL using UI Avatars
 * @param seed - String to use as seed for the avatar
 * @param size - Size of the avatar in pixels
 * @returns URL for a fallback avatar
 */
export function generateFallbackAvatarUrl(seed: string, size: number = 200) {
  // Generate a deterministic but still varied color based on the seed
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % 5;
  const backgroundColors = ['1abc9c', '3498db', '9b59b6', 'f1c40f', 'e74c3c'];
  
  // Create a UI Avatars URL with the seed and a background color
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=${backgroundColors[colorIndex]}&color=fff&size=${size}&format=png`;
}

/**
 * Fetch a random name from the Peoplify API
 * @param gender - Optional gender for the name
 * @returns Promise that resolves to a name object
 */
export async function fetchRandomName(gender?: 'Male' | 'Female') {
  try {
    const params = new URLSearchParams();
    if (gender) {
      params.append('gender', gender);
    }
    
    const response = await fetch(`/api/peoplify/name?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gender })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch name: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching random name:', error);
    
    // Return a fallback name
    return {
      firstName: gender === 'Female' ? 'Jane' : 'John',
      lastName: 'Doe',
      fullName: gender === 'Female' ? 'Jane Doe' : 'John Doe',
      email: gender === 'Female' ? 'jane.doe@example.com' : 'john.doe@example.com',
      gender: gender || (Math.random() > 0.5 ? 'Male' : 'Female')
    };
  }
}

/**
 * Extract an image URL from a student record
 * Handles both string URLs and object representations
 * @param imageUrl - The image URL or object from the student record
 * @param name - Fallback name to use for generating an avatar
 * @param gender - Fallback gender to use for generating an avatar
 * @param size - Size of the avatar in pixels
 * @returns A usable image URL string
 */
export function getStudentImageUrl(
  imageUrl: string | { seed: string; gender: string } | null | undefined,
  name: string,
  gender?: string,
  size: number = 200
): string {
  // If it's a string URL, use it directly
  if (typeof imageUrl === 'string') {
    return imageUrl;
  }
  
  // If it's an object with seed and gender, use the Peoplify API
  if (imageUrl && typeof imageUrl === 'object' && 'seed' in imageUrl) {
    const objGender = imageUrl.gender as 'Male' | 'Female';
    return generateFallbackAvatarUrl(imageUrl.seed, size);
  }
  
  // If we have no image URL at all, generate one based on name and gender
  const preferredGender = gender === 'Male' || gender === 'Female' ? gender : undefined;
  return generateFallbackAvatarUrl(name, size);
}

/**
 * Convert a database column name to camelCase for use in the Student interface
 * @param columnName - The database column name
 * @returns The column name converted to camelCase
 */
export function convertDbColumnToCamelCase(columnName: string): string {
  return columnName
    .toLowerCase()
    // Remove special characters and convert to space
    .replace(/[^\w\s]/g, ' ')
    // Convert spaces followed by a character to that character capitalized
    .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
    // Ensure the first character is lowercase
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}
