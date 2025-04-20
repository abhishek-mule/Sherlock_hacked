'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, AlertTriangle, CreditCard } from 'lucide-react';

export function ApiStatusBanner() {
  const [apiStatus, setApiStatus] = useState<'outdated' | 'no-credits' | 'ok' | 'unknown'>('unknown');
  const [dismissed, setDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true);
    
    // Check if the user has dismissed the banner in this session
    try {
      const dismissedStatus = window.sessionStorage?.getItem('api-banner-dismissed');
      if (dismissedStatus === 'true') {
        setDismissed(true);
        return;
      }
    } catch (e) {
      // Ignore any storage errors
      console.error('Session storage error:', e);
    }
    
    // Check API status
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/enrichment/status', {
          // Adding a cache-busting parameter
          headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            // API is configured correctly
            if (data.needsCredits) {
              // API is configured but needs more credits
              setApiStatus('no-credits');
            } else {
              // API is fully functional
              setApiStatus('ok');
            }
          } else {
            // API has configuration issues
            setApiStatus('outdated');
          }
        } else {
          // If we can't reach the status endpoint, assume there's an issue
          setApiStatus('outdated');
        }
      } catch (error) {
        console.error('Failed to check API status:', error);
        // If we can't even check the status, assume there's an issue
        setApiStatus('outdated');
      }
    };
    
    // Only check API status on client-side
    if (typeof window !== 'undefined') {
      checkApiStatus();
    }
  }, []);
  
  // Dismiss the banner for this session
  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage?.setItem('api-banner-dismissed', 'true');
    } catch (e) {
      // Ignore any storage errors
      console.error('Session storage error:', e);
    }
  };
  
  // Don't render anything on the server side
  if (!isClient || dismissed || apiStatus === 'ok' || apiStatus === 'unknown') {
    return null;
  }
  
  // Different banner content based on API status
  const bannerContent = {
    'outdated': {
      bgClass: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
      iconBgClass: 'bg-amber-100 dark:bg-amber-800',
      iconClass: 'text-amber-600 dark:text-amber-500',
      textClass: 'text-amber-700 dark:text-amber-300',
      buttonClass: 'text-amber-600 bg-white hover:bg-amber-50 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800',
      icon: <AlertTriangle className="h-5 w-5" />,
      shortMessage: 'Using outdated API endpoint',
      fullMessage: 'You are using an outdated API endpoint. Some features may not work properly.',
      buttonText: 'Fix Now',
      buttonLink: '/api-settings'
    },
    'no-credits': {
      bgClass: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      iconBgClass: 'bg-blue-100 dark:bg-blue-800',
      iconClass: 'text-blue-600 dark:text-blue-500',
      textClass: 'text-blue-700 dark:text-blue-300',
      buttonClass: 'text-blue-600 bg-white hover:bg-blue-50 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800',
      icon: <CreditCard className="h-5 w-5" />,
      shortMessage: 'API credits exhausted',
      fullMessage: 'Your API account is out of credits. The app will use mock data until credits are replenished.',
      buttonText: 'Add Credits',
      buttonLink: 'https://reversecontact.com/dashboard'
    }
  };
  
  const content = bannerContent[apiStatus];
  
  return (
    <div className={`${content.bgClass} border-b`}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center">
            <span className={`flex p-2 rounded-lg ${content.iconBgClass}`}>
              {content.icon}
            </span>
            <p className={`ml-3 font-medium ${content.textClass} truncate`}>
              <span className="md:hidden">{content.shortMessage}</span>
              <span className="hidden md:inline">{content.fullMessage}</span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Link
              href={content.buttonLink}
              target={apiStatus === 'no-credits' ? '_blank' : undefined}
              className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${content.buttonClass}`}
            >
              {content.buttonText}
            </Link>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              className={`-mr-1 flex p-2 rounded-md hover:${content.iconBgClass} focus:outline-none focus:ring-2 focus:ring-${apiStatus === 'outdated' ? 'amber' : 'blue'}-500`}
              onClick={dismiss}
            >
              <span className="sr-only">Dismiss</span>
              <X className={`h-5 w-5 ${content.iconClass}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 