import multiavatar from '@multiavatar/multiavatar';

/**
 * Generates an SVG avatar using the multiavatar library
 * @param seed - The seed string to generate a consistent avatar
 * @param sansEnv - Whether to exclude the background (defaults to false)
 * @returns The SVG code as a string
 */
export function generateAvatar(seed: string, sansEnv: boolean = false): string {
  try {
    // Generate the avatar SVG code
    const svgCode = multiavatar(seed, sansEnv);
    return svgCode;
  } catch (error) {
    console.error('Error generating avatar:', error);
    return ''; // Return empty string on error
  }
}

/**
 * Converts SVG code to a Data URL that can be used with the Next.js Image component
 * @param svgCode - The SVG code to convert
 * @returns A data URL with the SVG content
 */
export function svgToDataUrl(svgCode: string): string {
  if (!svgCode) {
    return ''; // Return empty string if no SVG code
  }
  
  try {
    // Convert SVG to a data URL
    const encodedSvg = encodeURIComponent(svgCode);
    return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  } catch (error) {
    console.error('Error converting SVG to data URL:', error);
    return ''; // Return empty string on error
  }
}

/**
 * Generates an avatar data URL that can be used directly with the Image component
 * @param seed - The seed string to generate a consistent avatar
 * @param sansEnv - Whether to exclude the background (defaults to false)
 * @returns A data URL with the SVG content
 */
export function generateAvatarDataUrl(seed: string, sansEnv: boolean = false): string {
  const svgCode = generateAvatar(seed, sansEnv);
  return svgToDataUrl(svgCode);
} 