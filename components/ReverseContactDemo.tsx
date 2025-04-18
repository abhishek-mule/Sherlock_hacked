import React, { useState } from 'react';
import ApiStatusChecker from './ApiStatusChecker';
// Remove unused Image import since we're using standard img tags
// import Image from 'next/image';

interface ReverseContactDemoProps {
  initialEmail?: string;
}

interface Position {
  title: string;
  companyName: string;
  description?: string;
  startEndDate: {
    start: { month?: number; year?: number } | null;
    end: { month?: number; year?: number } | null;
  };
  companyLogo?: string;
  linkedInUrl?: string;
  linkedInId?: string;
}

interface Education {
  schoolName: string;
  degreeName?: string;
  fieldOfStudy?: string;
  schoolLogo?: string;
  linkedInUrl?: string;
  startEndDate: {
    start: { month?: number; year?: number } | null;
    end: { month?: number; year?: number } | null;
  };
}

interface PersonData {
  firstName: string;
  lastName: string;
  headline?: string;
  photoUrl?: string;
  backgroundUrl?: string;
  location?: string;
  summary?: string;
  linkedInUrl?: string;
  linkedInIdentifier?: string;
  publicIdentifier?: string;
  memberIdentifier?: string;
  followerCount?: number;
  positions?: {
    positionsCount?: number;
    positionHistory?: Position[];
  };
  schools?: {
    educationsCount?: number;
    educationHistory?: Education[];
  };
  skills?: string[];
  languages?: string[];
  openToWork?: boolean;
  premium?: boolean;
}

interface CompanyData {
  name: string;
  industry?: string;
  logo?: string;
  websiteUrl?: string;
  linkedInUrl?: string;
  linkedInId?: string;
  universalName?: string;
  employeeCount?: number;
  employeeCountRange?: {
    start?: number;
    end?: number;
  };
  description?: string;
  tagline?: string;
  specialities?: string[];
  followerCount?: number;
  headquarter?: {
    city?: string;
    geographicArea?: string;
    country?: string;
    postalCode?: string;
    street1?: string;
    street2?: string;
  };
}

interface ApiResponse {
  success: boolean;
  email: string;
  emailType?: string;
  credits_left: number;
  rate_limit_left?: number;
  person?: PersonData;
  company?: CompanyData;
  _source?: string;
  _api_error?: string;
  _api_message?: string;
  _error_message?: string;
}

const ReverseContactDemo: React.FC<ReverseContactDemoProps> = ({ initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail || 'bill.gates@microsoft.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [showApiStatus, setShowApiStatus] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/enrichment?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve data');
      }

      setResult(data);
      console.log("API Response:", data); // For debugging
      
      // If we got mock data, show the API status checker
      if (data._source === 'mock_data') {
        setShowApiStatus(true);
      }
    } catch (err: any) {
      console.error("API Error:", err); // For debugging
      setError(err.message || 'An error occurred');
      setShowApiStatus(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date from the API
  const formatDate = (dateInfo: { month?: number; year?: number } | null) => {
    if (!dateInfo) return '';
    
    const month = dateInfo.month 
      ? new Date(0, dateInfo.month - 1).toLocaleString('default', { month: 'short' }) 
      : '';
    const year = dateInfo.year || '';
    
    return month && year ? `${month} ${year}` : year;
  };

  // Check if an image URL is valid
  const isValidImageUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('http') && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.includes('media.licdn.com'));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Reverse Contact API Demo</h2>
      
      {showApiStatus && (
        <ApiStatusChecker 
          onFix={() => {
            window.open("https://reversecontact.com/dashboard", "_blank")
          }}
        />
      )}
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input 
            type="email" 
            value={email} 
            onChange={handleEmailChange} 
            placeholder="Enter email address" 
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Lookup'}
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-gray-500">
            Try examples: bill.gates@microsoft.com, satya@microsoft.com, etc.
          </p>
          <button
            type="button" 
            onClick={() => setShowApiStatus(!showApiStatus)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showApiStatus ? 'Hide API Status' : 'Check API Status'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {result && !loading && (
        <div className="mt-4">
          <div className="mb-4">
            {result._source === 'mock_data' && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Using Mock Data</p>
                <p className="text-sm">API request failed or returned no results. Displaying generated data instead.</p>
                {result._api_error && <p className="text-xs mt-1">Error: {result._api_error}</p>}
                {result._api_message && <p className="text-xs mt-1">Message: {result._api_message}</p>}
              </div>
            )}
            {result._source === 'reversecontact_api' && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Data from Reverse Contact API</p>
                <p className="text-sm">Successfully retrieved real data from the API.</p>
                <p className="text-xs mt-1">Credits remaining: {result.credits_left}</p>
                {result.rate_limit_left && <p className="text-xs">Rate limit remaining: {result.rate_limit_left}</p>}
              </div>
            )}
          </div>

          {result.person && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50">
                <h3 className="font-bold text-lg">Person Information</h3>
              </div>
              
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile photo */}
                  {result.person.photoUrl && isValidImageUrl(result.person.photoUrl) && (
                    <div className="flex-shrink-0">
                      <img 
                        src={result.person.photoUrl}
                        alt={`${result.person.firstName} ${result.person.lastName}`}
                        className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Basic info */}
                  <div className="flex-grow">
                    <h4 className="text-xl font-bold">
                      {result.person.firstName} {result.person.lastName}
                    </h4>
                    
                    {result.person.headline && (
                      <p className="text-gray-600 mt-1">{result.person.headline}</p>
                    )}
                    
                    {result.person.location && (
                      <p className="text-gray-500 text-sm mt-2">
                        <span className="inline-block w-4 h-4 mr-2">📍</span>
                        {result.person.location}
                      </p>
                    )}
                    
                    {result.person.linkedInUrl && (
                      <p className="mt-2">
                        <a 
                          href={result.person.linkedInUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                          LinkedIn Profile
                        </a>
                      </p>
                    )}
                    
                    {result.person.followerCount && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="inline-block w-4 h-4 mr-1">👥</span>
                        {result.person.followerCount.toLocaleString()} LinkedIn followers
                      </p>
                    )}
                    
                    {result.person.openToWork && (
                      <p className="text-sm text-green-600 mt-1 font-medium">
                        Open to work
                      </p>
                    )}
                    
                    {result.person.summary && (
                      <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                        <p className="font-semibold mb-1">Summary</p>
                        <p>{result.person.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Work Experience */}
                {result.person.positions?.positionHistory && result.person.positions.positionHistory.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Work Experience</h5>
                    <div className="space-y-4">
                      {result.person.positions.positionHistory.map((position, index) => (
                        <div key={index} className="flex gap-3">
                          {position.companyLogo && isValidImageUrl(position.companyLogo) && (
                            <div className="flex-shrink-0">
                              <img 
                                src={position.companyLogo} 
                                alt={position.companyName}
                                className="w-10 h-10 object-contain border border-gray-200 rounded"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <h6 className="font-medium">{position.title}</h6>
                            <p className="text-sm text-gray-600">
                              {position.companyName}
                              {position.linkedInUrl && (
                                <a 
                                  href={position.linkedInUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline ml-2 inline-flex items-center"
                                >
                                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                  </svg>
                                </a>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(position.startEndDate.start)} - {position.startEndDate.end ? formatDate(position.startEndDate.end) : 'Present'}
                            </p>
                            {position.description && (
                              <p className="text-sm mt-1 text-gray-700">{position.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {result.person.schools?.educationHistory && result.person.schools.educationHistory.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Education</h5>
                    <div className="space-y-4">
                      {result.person.schools.educationHistory.map((education, index) => (
                        <div key={index} className="flex gap-3">
                          {education.schoolLogo && isValidImageUrl(education.schoolLogo) && (
                            <div className="flex-shrink-0">
                              <img 
                                src={education.schoolLogo}
                                alt={education.schoolName}
                                className="w-10 h-10 object-contain border border-gray-200 rounded"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <h6 className="font-medium">
                              {education.schoolName}
                              {education.linkedInUrl && (
                                <a 
                                  href={education.linkedInUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline ml-2 inline-flex items-center"
                                >
                                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                  </svg>
                                </a>
                              )}
                            </h6>
                            {(education.degreeName || education.fieldOfStudy) && (
                              <p className="text-sm text-gray-600">
                                {education.degreeName}{education.degreeName && education.fieldOfStudy ? ', ' : ''}{education.fieldOfStudy}
                              </p>
                            )}
                            {(education.startEndDate?.start?.year || education.startEndDate?.end?.year) && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(education.startEndDate.start)} - {education.startEndDate.end ? formatDate(education.startEndDate.end) : 'Present'}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {result.person.skills && result.person.skills.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.person.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Languages */}
                {result.person.languages && result.person.languages.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Languages</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.person.languages.map((language, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Company Information */}
          {result.company && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="font-bold text-lg">Company Information</h3>
              </div>
              
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Company logo */}
                  {result.company.logo && isValidImageUrl(result.company.logo) && (
                    <div className="flex-shrink-0">
                      <img 
                        src={result.company.logo}
                        alt={result.company.name}
                        className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-2"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Company details */}
                  <div className="flex-grow">
                    <h4 className="text-xl font-bold">{result.company.name}</h4>
                    
                    {result.company.tagline && (
                      <p className="text-gray-700 italic mt-1">{result.company.tagline}</p>
                    )}
                    
                    {result.company.industry && (
                      <p className="text-gray-600 mt-1">{result.company.industry}</p>
                    )}
                    
                    {result.company.headquarter && (
                      <p className="text-gray-500 text-sm mt-2">
                        <span className="inline-block w-4 h-4 mr-2">📍</span>
                        {result.company.headquarter.city}{result.company.headquarter.city && result.company.headquarter.geographicArea ? ', ' : ''}
                        {result.company.headquarter.geographicArea}{(result.company.headquarter.city || result.company.headquarter.geographicArea) && result.company.headquarter.country ? ', ' : ''}
                        {result.company.headquarter.country}
                      </p>
                    )}
                    
                    <div className="mt-2 space-y-1">
                      {result.company.websiteUrl && (
                        <p>
                          <a 
                            href={result.company.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            <span className="inline-block w-4 h-4 mr-2">🌐</span>
                            {result.company.websiteUrl.replace(/^https?:\/\//, '')}
                          </a>
                        </p>
                      )}
                      
                      {result.company.linkedInUrl && (
                        <p>
                          <a 
                            href={result.company.linkedInUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                            </svg>
                            Company LinkedIn
                          </a>
                        </p>
                      )}
                      
                      {result.company.employeeCount && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="inline-block w-4 h-4 mr-2">👥</span>
                          {result.company.employeeCount.toLocaleString()} employees
                        </p>
                      )}
                      
                      {result.company.followerCount && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="inline-block w-4 h-4 mr-2">👁️</span>
                          {result.company.followerCount.toLocaleString()} LinkedIn followers
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Company specialties */}
                {result.company.specialities && result.company.specialities.length > 0 && (
                  <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                    <p className="font-semibold mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {result.company.specialities.map((specialty, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Company description */}
                {result.company.description && (
                  <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                    <p className="font-semibold mb-1">About</p>
                    <p className="whitespace-pre-line">{result.company.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Data Toggle */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500 font-medium">
              View Raw API Response
            </summary>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 mt-2">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default ReverseContactDemo; 
