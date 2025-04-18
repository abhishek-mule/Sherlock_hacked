"use client";

import React from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { SimpleReverseContactDemo } from "@/components/SimpleReverseContactDemo";
import { useSearchParams } from "next/navigation";

export default function ReverseContactDemoPage() {
  const searchParams = useSearchParams();
  const email = searchParams ? searchParams.get('email') : null;
  const autoSearch = searchParams ? searchParams.get('auto') : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header section */}
      <header className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-10 px-4 md:py-16">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Email Intelligence</h1>
          <p className="text-teal-100 max-w-2xl">
            Discover detailed information about any person using just their email address.
            Powered by Reverse Contact API.
          </p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto max-w-4xl px-4 -mt-8 mb-24">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 md:p-8">
          <SimpleReverseContactDemo />
        </div>
        
        {/* Additional info section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Privacy First</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">All lookups are secure and private. We don&apos;t store search data or share results with third parties.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Company Insights</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Get detailed information about companies, including size, industry, and social profiles.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Social Profiles</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Discover LinkedIn, Twitter, Facebook and other social media profiles linked to an email address.</p>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
} 