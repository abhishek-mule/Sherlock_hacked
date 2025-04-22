import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader 
} from '@/components/ui/card';
import { AnimatedPage } from '@/components/AnimatedPage';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Type definitions
interface PeoplifyAvatar {
  id: string;
  name: string;
  imageUrl: string;
  gender?: 'male' | 'female' | 'other';
}

interface RandomAvatarsGridProps {
  initialCount?: number;
  onSelectAvatar?: (avatar: PeoplifyAvatar) => void;
  maxColumns?: 2 | 3 | 4 | 5 | 6;
}

// API endpoints
const PEOPLIFY_AVATAR_API = '/api/peoplify/avatar';
const PEOPLIFY_NAME_API = '/api/peoplify/name';

export function RandomAvatarsGrid({ 
  initialCount = 12, 
  onSelectAvatar,
  maxColumns = 4 
}: RandomAvatarsGridProps) {
  const [avatars, setAvatars] = useState<PeoplifyAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to generate random parameters for avatar API
  const generateRandomAvatarParams = () => {
    const genders = ['male', 'female'];
    const hairTypes = ['long', 'short', 'curly', 'straight', 'wavy'];
    const hairColors = ['black', 'brown', 'blonde', 'red', 'gray'];
    const glasses = [true, false];
    const beards = [true, false];
    
    return {
      gender: genders[Math.floor(Math.random() * genders.length)],
      hairType: hairTypes[Math.floor(Math.random() * hairTypes.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      glasses: glasses[Math.floor(Math.random() * glasses.length)],
      beard: beards[Math.floor(Math.random() * beards.length)],
    };
  };

  // Function to fetch names from the Peoplify API
  const fetchNames = async (count: number) => {
    try {
      const response = await fetch(`${PEOPLIFY_NAME_API}?count=${count}`);
      if (!response.ok) {
        throw new Error('Failed to fetch names');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching names:', err);
      return Array(count).fill(null).map((_, i) => ({
        firstName: `Student ${i + 1}`,
        lastName: `Test`,
        gender: i % 2 === 0 ? 'male' : 'female'
      }));
    }
  };

  // Function to fetch avatars from the Peoplify API
  const fetchAvatars = async (count: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // First get names
      const names = await fetchNames(count);
      
      // Then get avatars for each name
      const newAvatars: PeoplifyAvatar[] = await Promise.all(
        names.map(async (nameData: any, index: number) => {
          const params = generateRandomAvatarParams();
          // Use the name's gender for the avatar if available
          params.gender = nameData.gender || params.gender;
          
          try {
            const queryParams = new URLSearchParams(params as any).toString();
            const response = await fetch(`${PEOPLIFY_AVATAR_API}?${queryParams}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch avatar ${index + 1}`);
            }
            
            const data = await response.json();
            return {
              id: `avatar-${index + 1}-${Date.now()}`,
              name: `${nameData.firstName} ${nameData.lastName}`,
              imageUrl: data.imageUrl || `https://avatars.dicebear.com/api/bottts/${index}.svg`,
              gender: params.gender as 'male' | 'female' | 'other'
            };
          } catch (err) {
            console.error(`Error fetching avatar ${index + 1}:`, err);
            // Fallback to a default avatar
            return {
              id: `avatar-${index + 1}-${Date.now()}`,
              name: `${nameData.firstName} ${nameData.lastName}`,
              imageUrl: `https://avatars.dicebear.com/api/bottts/${nameData.firstName}-${index}.svg`,
              gender: params.gender as 'male' | 'female' | 'other'
            };
          }
        })
      );
      
      setAvatars(newAvatars);
    } catch (err) {
      console.error('Error generating avatars:', err);
      setError('Failed to load avatars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load of avatars
  useEffect(() => {
    fetchAvatars(initialCount);
  }, [initialCount]);

  // Handle avatar selection
  const handleAvatarClick = (avatar: PeoplifyAvatar) => {
    if (onSelectAvatar) {
      onSelectAvatar(avatar);
    }
  };

  // Refresh avatars handler
  const handleRefresh = () => {
    fetchAvatars(initialCount);
  };

  return (
    <AnimatedPage>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Random Student Avatars
        </h2>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Avatars
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${maxColumns} gap-4`}>
        {loading ? (
          // Loading placeholders
          Array(initialCount).fill(null).map((_, index) => (
            <Card key={`loading-${index}`} className="border-2 border-slate-100 dark:border-slate-800">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
              <CardContent className="p-3">
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual avatars
          avatars.map((avatar) => (
            <Card 
              key={avatar.id} 
              className="border-2 border-slate-100 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 transition-colors cursor-pointer overflow-hidden"
              onClick={() => handleAvatarClick(avatar)}
            >
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <img 
                  src={avatar.imageUrl} 
                  alt={avatar.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-slate-900 dark:text-white truncate text-center">
                  {avatar.name}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AnimatedPage>
  );
} 