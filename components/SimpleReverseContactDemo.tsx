"use client";

import React, { useState, useEffect } from 'react';

interface PersonData {
  firstName?: string;
  lastName?: string;
  headline?: string;
  photoUrl?: string;
  location?: string;
  summary?: string;
  linkedInUrl?: string;
  skills?: string[];
  languages?: string[];
}

interface CompanyData {
  name?: string;
  industry?: string;
  logo?: string;
  websiteUrl?: string;
  linkedInUrl?: string;
  description?: string;
}

interface ApiResponse {
  success?: boolean;
  email?: string;
  credits_left?: number;
  person?: PersonData;
  company?: CompanyData;
  _source?: string;
  _api_error?: string;
  _api_message?: string;
}

export function SimpleReverseContactDemo() {
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [searchMode, setSearchMode] = useState<'email' | 'linkedin'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<string | null>(null);
  const [isPreFilledEmail, setIsPreFilledEmail] = useState(false);

  // Add useEffect to check for email parameter in URL
  useEffect(() => {
    // Check if we're in a browser environment (client-side)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const emailParam = searchParams?.get('email');
      
      if (emailParam) {
        // Only set the email from URL parameter, don't auto-submit
        setEmail(emailParam);
        setSearchMode('email');
        setIsPreFilledEmail(true);
      }
    }
  }, []);
  
  // Define fadeIn animation in a style tag
  React.useEffect(() => {
    // Add fadeIn animation if it doesn't exist
    if (!document.getElementById('fadeInAnimation')) {
      const style = document.createElement('style');
      style.id = 'fadeInAnimation';
      style.innerHTML = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Cleanup
      const style = document.getElementById('fadeInAnimation');
      if (style) {
        style.remove();
      }
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchMode === 'email' && !email) {
      setError('Please enter an email address');
      return;
    }
    
    if (searchMode === 'linkedin' && !linkedinUrl) {
      setError('Please enter a LinkedIn profile URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setExtractedProfile(null);

    try {
      // Determine the endpoint based on search mode
      const endpoint = searchMode === 'email' 
        ? `/api/enrichment?email=${encodeURIComponent(email)}`
        : `/api/osint/enrichment?linkedin_url=${encodeURIComponent(linkedinUrl)}`;

      // First try server-side API for safety (handles API keys securely)
      let response = await fetch(endpoint);
      let data = await response.json();

      if (!response.ok) {
        // If server-side API fails, try direct API call (only for demo)
        console.log("Server-side API failed, trying direct API call...");
        
        const options = {
          method: 'GET',
          headers: {
            // Note: In a production app, you would never expose API keys in frontend code
            // This is only for demonstration purposes
            'Authorization': 'Bearer sk_db8a53e6a46f64e31c6d764a96d56ac546afa237',
            'Content-Type': 'application/json',
          }
        };
        
        const apiUrl = searchMode === 'email'
          ? `https://api.reversecontact.com/enrichment?email=${encodeURIComponent(email)}`
          : `https://api.reversecontact.com/enrichment/profile?url=${encodeURIComponent(linkedinUrl)}`;
          
        try {
          const directResponse = await fetch(apiUrl, options);
          if (directResponse.ok) {
            data = await directResponse.json();
            console.log("Direct API call succeeded:", data);
          } else {
            const errorText = await directResponse.text();
            console.error("Direct API call failed:", errorText);
            throw new Error(data.error || 'Failed to retrieve data from both APIs');
          }
        } catch (directApiError) {
          console.error("Direct API call error:", directApiError);
          throw new Error(data.error || 'Failed to retrieve data');
        }
      }

      setResult(data);
      
      // Extract person profile as JSON string for display
      if (data.person) {
        setExtractedProfile(JSON.stringify(data.person, null, 2));
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setEmail('');
    setLinkedinUrl('');
    setResult(null);
    setError(null);
    setExtractedProfile(null);
  };

  // Check if an image URL is valid
  const isValidImageUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('http') && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.includes('media.licdn.com'));
  };

  return (
    <div>
      {!result ? (
        <>
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Email Intelligence</h2>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md mb-4 text-sm border border-red-200 dark:border-red-800 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-4">
            <div className="inline-flex rounded-md shadow-sm mb-6" role="group">
              <button
                type="button"
                onClick={() => setSearchMode('email')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  searchMode === 'email' 
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                } border border-gray-200 dark:border-gray-600`}
              >
                Email Lookup
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('linkedin')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  searchMode === 'linkedin' 
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                } border border-gray-200 dark:border-gray-600 border-l-0`}
              >
                LinkedIn Profile
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {searchMode === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  required
                />
                {isPreFilledEmail && (
                  <p className="mt-2 text-sm text-teal-600 dark:text-teal-400 animate-fadeIn">
                    Email pre-filled from student data. Click the &quot;Look Up Email&quot; button to perform the search.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 flex items-center ${isPreFilledEmail ? 'animate-pulse ring-2 ring-teal-300 dark:ring-teal-700' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  searchMode === 'email' ? "Look Up Email" : "Look Up Profile"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (searchMode === 'email') {
                    setEmail('bill.gates@microsoft.com');
                  } else {
                    setLinkedinUrl('https://www.linkedin.com/in/williamhgates');
                  }
                }}
                className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
              >
                Try an example
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This tool uses the Reverse Contact API to find information about a person using just their email address or LinkedIn profile. 
              We support searching by email (e.g., bill.gates@microsoft.com) or LinkedIn URL (e.g., linkedin.com/in/williamhgates).
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Results for {result.email || linkedinUrl}
            </h2>
            <button
              onClick={handleReset}
              className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
            >
              New Search
            </button>
          </div>
          
          {result._source === 'mock_data' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-3 rounded-md mb-4 text-sm border border-amber-200 dark:border-amber-800">
              <p className="font-medium">Using mock data</p>
              <p className="text-xs mt-1">The API returned mock data because a real API key isn&apos;t configured or the profile wasn&apos;t found.</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Person information card */}
            {result.person && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Person Information</h3>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {result.person.photoUrl && isValidImageUrl(result.person.photoUrl) && (
                      <img 
                        src={result.person.photoUrl} 
                        alt={`${result.person.firstName || ''} ${result.person.lastName || ''}`}
                        className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                    )}
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {result.person.firstName} {result.person.lastName}
                      </h4>
                      
                      {result.person.headline && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.person.headline}</p>
                      )}
                      
                      {result.person.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                          <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {result.person.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {result.person.linkedInUrl && (
                    <a 
                      href={result.person.linkedInUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-sm text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                      </svg>
                      LinkedIn Profile
                    </a>
                  )}
                  
                  {result.person.skills && result.person.skills.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-1">
                        {result.person.skills.slice(0, 6).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {result.person.skills.length > 6 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            +{result.person.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Company information card */}
            {result.company && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Company Information</h3>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {result.company.logo && isValidImageUrl(result.company.logo) && (
                      <img 
                        src={result.company.logo} 
                        alt={`${result.company.name} logo`}
                        className="w-12 h-12 object-contain bg-white p-1 border border-gray-200 dark:border-gray-700 rounded"
                      />
                    )}
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {result.company.name}
                      </h4>
                      
                      {result.company.industry && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.company.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {result.company.websiteUrl && (
                      <a 
                        href={result.company.websiteUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        <svg className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                        </svg>
                        {result.company.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    
                    {result.company.linkedInUrl && (
                      <a 
                        href={result.company.linkedInUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        <svg className="h-4 w-4 mr-1 inline-block" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path>
                        </svg>
                        Company LinkedIn
                      </a>
                    )}
                  </div>
                  
                  {result.company.description && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {result.company.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Extracted Person Data Profile */}
          {extractedProfile && (
            <div className="mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Extracted Person Data Profile</h3>
                </div>
                <div className="p-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 overflow-auto max-h-60">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{extractedProfile}</pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(extractedProfile);
                      alert("Data copied to clipboard!");
                    }}
                    className="mt-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-400"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Credits information */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Credits remaining: {result.credits_left}
            </p>
          </div>
        </>
      )}
    </div>
  );
} 