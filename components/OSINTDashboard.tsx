// Define the interface for OSINT data
export interface OSINTCompany {
  name: string;
  industry?: string;
  employeeCount?: number;
  headquarter?: {
    city: string;
    geographicArea: string;
  };
  logo?: string;
  websiteUrl?: string;
  linkedInUrl?: string;
  description?: string;
}

export interface OSINTPosition {
  title: string;
  companyName: string;
  description?: string;
  startEndDate?: {
    start: { month?: number; year?: number };
    end?: { month?: number; year?: number } | null;
  };
}

export interface OSINTPerson {
  firstName?: string;
  lastName?: string;
  headline?: string;
  photoUrl?: string;
  location?: string;
  linkedInUrl?: string;
  linkedInIdentifier?: string;
  positions?: {
    positionHistory?: OSINTPosition[];
  };
  socialProfiles?: Array<{
    platform: string;
    url: string;
    username: string;
  }>;
  skills?: string[];
}

export interface OSINTResult {
  company?: OSINTCompany;
  person?: OSINTPerson;
  error?: string;
}

// Function to perform OSINT lookup (real API call)
export async function performOSINTLookup(email: string): Promise<OSINTResult> {
  try {
    const response = await fetch(`/api/enrichment?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OSINT lookup error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred during OSINT lookup'
    };
  }
}

// Fallback function to generate mock OSINT data when API is unavailable
export function generateMockOSINTData(email: string) {
  // Generate a deterministic but fake hash based on the email
  const emailHash = Array.from(email).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Extract domain from email
  const domain = email.split('@')[1];
  
  return {
    email,
    found: true,
    breaches: [
      {
        name: `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Database`,
        date: `${2018 + (emailHash % 5)}-${(emailHash % 12) + 1}-${(emailHash % 28) + 1}`,
        description: "Mock data breach for demonstration purposes",
        dataTypes: ["email", "password", "username"]
      },
      {
        name: "MockLeaks",
        date: `${2020 + (emailHash % 3)}-${((emailHash * 2) % 12) + 1}-${((emailHash * 3) % 28) + 1}`,
        description: "This is simulated breach data for testing purposes",
        dataTypes: ["email", "name", "phone"]
      }
    ],
    socialProfiles: [
      {
        platform: "Twitter",
        username: `${email.split('@')[0]}_${(emailHash % 1000)}`,
        url: `https://twitter.com/${email.split('@')[0]}_${(emailHash % 1000)}`,
        followers: 100 + (emailHash % 900)
      },
      {
        platform: "LinkedIn",
        username: email.split('@')[0],
        url: `https://linkedin.com/in/${email.split('@')[0]}-${(emailHash % 100)}`,
        followers: 200 + (emailHash % 300)
      }
    ],
    relatedEmails: [
      `${email.split('@')[0]}.work@${domain}`,
      `${email.split('@')[0]}.personal@${domain}`,
      `${email.split('@')[0]}${(emailHash % 100)}@${domain}`
    ],
    phoneNumbers: [
      `+1${(emailHash % 900) + 100}${(emailHash % 900) + 100}${(emailHash % 9000) + 1000}`
    ]
  };
} 