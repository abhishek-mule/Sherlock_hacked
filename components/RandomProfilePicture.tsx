'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateAvatarDataUrl } from '@/lib/avatar-utils';

interface RandomProfilePictureProps {
  seed?: string;
  gender?: 'Male' | 'Female';
  size?: number;
  className?: string;
  alt?: string;
  onImageLoad?: () => void;
}

export function RandomProfilePicture({
  seed,
  gender,
  size = 100,
  className = '',
  alt = 'Profile picture',
  onImageLoad
}: RandomProfilePictureProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const generateAvatar = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsFallback(false);
        
        // Create a default fallback in case all else fails
        const defaultFallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(seed || 'User')}&background=random&color=fff&size=${size}&format=png`;
        
        // Extract name from seed or create a stable seed
        const seedValue = seed || Math.random().toString(36).substring(2, 12);
        
        // Generate avatar locally using the multiavatar library
        const avatarDataUrl = generateAvatarDataUrl(seedValue);
        
        if (!avatarDataUrl) {
          throw new Error('Failed to generate avatar');
        }
        
        // Set the data URL for the avatar
        setImageUrl(avatarDataUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Error generating avatar:', err);
        setError('Failed to generate avatar');
        setIsFallback(true);
        
        // Use a fallback image - ensure we always have something to display
        const fallbackSeed = seed || 'user';
        setImageUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackSeed)}&background=random&color=fff&size=${size}&format=png`);
        setIsLoading(false);
      }
    };

    generateAvatar();
  }, [seed, size]);

  // Handle case where imageUrl is an object with seed and gender properties (from the Student type)
  useEffect(() => {
    if (typeof imageUrl === 'object' && imageUrl !== null) {
      setIsFallback(true);
      
      const objSeed = (imageUrl as any).seed || 'user';
      
      // Generate avatar locally for object seeds too
      try {
        const avatarDataUrl = generateAvatarDataUrl(objSeed);
        setImageUrl(avatarDataUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(objSeed)}&background=random&color=fff&size=${size}&format=png`);
      } catch (err) {
        console.error('Error generating avatar from object seed:', err);
        setImageUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(objSeed)}&background=random&color=fff&size=${size}&format=png`);
      }
    }
  }, [imageUrl, size]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-xs text-gray-500 text-center px-2">Failed to load image</span>
        </div>
      )}
      
      {isFallback && !error && !isLoading && (
        <div className="absolute bottom-0 right-0 bg-amber-100 dark:bg-amber-800 rounded-full w-4 h-4 flex items-center justify-center" title="Using fallback avatar">
          <span className="text-xs text-amber-600 dark:text-amber-200">!</span>
        </div>
      )}
      
      {imageUrl && typeof imageUrl === 'string' && (
        <div className="h-full w-full rounded-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={alt}
            width={size}
            height={size}
            className="h-full w-full object-cover"
            priority={true}
            onLoad={() => {
              setIsLoading(false);
              if (onImageLoad) onImageLoad();
            }}
            onError={() => {
              console.error('Image failed to load:', imageUrl);
              setError('Failed to load image');
              setIsLoading(false);
              setIsFallback(true);
              
              // If image fails to load, set a truly basic fallback
              setImageUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(seed || 'User')}&background=random&color=fff&size=${size}&format=png`);
            }}
          />
        </div>
      )}
    </div>
  );
} 