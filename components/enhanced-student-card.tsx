import React, { useEffect, useState, useMemo } from 'react';
import { Student } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Award, BookOpen, Fingerprint, AlertTriangle, ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ApiStatusOverlay } from './ApiStatusOverlay';
import { RandomProfilePicture } from './RandomProfilePicture';
import { getStudentImageUrl } from '@/lib/utils';

interface EnhancedStudentCardProps {
  student: Student;
  onOsintLookup?: (student: Student) => void;
  isCompact?: boolean;
}

export function EnhancedStudentCard({
  student,
  isCompact = false,
  onOsintLookup,
}: EnhancedStudentCardProps) {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<'active' | 'outdated' | 'unknown'>('unknown');
  const [isClient, setIsClient] = useState(false);
  
  const lastActivity = useMemo(() => {
    return student?.last_activity
      ? new Date(student.last_activity)
      : new Date();
  }, [student?.last_activity]);

  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation delays for staggered entrance
  const baseDelay = useMemo(() => Math.random() * 0.5, []); // Random delay between 0-0.5s
  
  // Check API status when component mounts
  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);
    
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/enrichment/status', {
          // Adding cache busting headers
          headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            setApiStatus('active');
          } else {
            setApiStatus('outdated');
          }
        } else {
          // If the request fails, consider the API outdated
          setApiStatus('outdated');
        }
      } catch (error) {
        console.error('Failed to check API status:', error);
        setApiStatus('outdated');
      }
    };
    
    // Only check status on the client
    if (typeof window !== 'undefined') {
      checkApiStatus();
    }
  }, []);
  
  const handleOsintLookup = () => {
    if (student.email) {
      // Redirect to the email lookup page with student's email auto-filled
      // but don't automatically trigger the search
      router.push(`/reversecontact-demo?email=${encodeURIComponent(student.email)}`);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { 
      y: -5, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 10 }
    }
  };

  const infoItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.4
      }
    })
  };
  
  return (
    <Card 
      className={`relative overflow-hidden animate-cardEntrance glass-card ${
        isCompact ? "max-w-md" : "w-full"
      }`} 
      style={{ animationDelay: `${baseDelay}s` }}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="border-2 border-white shadow-md">
            <RandomProfilePicture
              seed={student.email}
              gender={student.gender || "male"}
              size={isCompact ? 40 : 48}
              className="h-auto w-auto transition-transform duration-300 hover:scale-105"
              alt={`Profile picture of ${student.first_name} ${student.last_name}`}
            />
            <AvatarFallback>
              {student.first_name?.[0]}
              {student.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold gradient-text">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {student.email}
                </p>
              </div>
              <Badge 
                className={`${
                  student.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                } animate-pulse-soft`}
              >
                {student.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="animate-popIn pl-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Student ID
                </h4>
                <p className="text-sm">{student.student_id || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Activity
                </h4>
                <p className="text-sm">
                  {lastActivity?.toLocaleDateString() || "-"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Course
                </h4>
                <p className="text-sm">{student.course || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Grade
                </h4>
                <p className="text-sm">{student.grade || "-"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs mobile-ripple"
          >
            {isExpanded ? "Less Info" : "More Info"}
            {isExpanded ? (
              <ChevronUpIcon className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDownIcon className="ml-1 h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs mobile-ripple"
            onClick={() => onOsintLookup(student)}
          >
            <SearchIcon className="mr-1 h-3 w-3" />
            OSINT Lookup
          </Button>
        </div>
      </div>
    </Card>
  );
} 