import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ApiStatusOverlayProps {
  message?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  size?: 'sm' | 'md' | 'lg';
}

export function ApiStatusOverlay({ 
  message = 'You are using an outdated API endpoint', 
  position = 'bottom-left',
  size = 'sm' 
}: ApiStatusOverlayProps) {
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };
  
  // Size classes
  const sizeClasses = {
    'sm': 'text-xs px-1.5 py-0.5',
    'md': 'text-sm px-2 py-1',
    'lg': 'text-base px-3 py-1.5'
  };
  
  return (
    <div className={`absolute ${positionClasses[position]} z-10`}>
      <div className={`bg-amber-500 text-white rounded flex items-center ${sizeClasses[size]} shadow-md`}>
        <AlertTriangle className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />
        <span>{message}</span>
      </div>
    </div>
  );
} 