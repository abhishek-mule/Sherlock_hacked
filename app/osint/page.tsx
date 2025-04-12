"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Fingerprint, Github, Linkedin, Instagram, Facebook, Twitter, ExternalLink } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";

interface SocialProfile {
  platform: string;
  url: string;
  icon: any;
  username: string;
}

export default function OSINTPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);

  useEffect(() => {
    // Read the query parameter when the component mounts
    const searchParams = new URLSearchParams(window.location.search);
    const name = searchParams.get("name");
    
    if (name) {
      setStudentName(name);
      generateSocialProfiles(name);
    }
  }, []);
  
  const generateSocialProfiles = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);
    let firstName = "";
    let lastName = "";
    
    if (nameParts.length === 1) {
      firstName = nameParts[0];
    } else if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join("");
    }
    
    // Convert to lowercase and remove special characters
    firstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    lastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Generate different username patterns
    const usernameFormats = [
      `${firstName}${lastName}`,
      `${firstName}.${lastName}`,
      `${firstName}_${lastName}`,
      `${firstName}${lastName[0]}`,
      `${firstName[0]}${lastName}`,
      lastName.length > 0 ? lastName : firstName,
    ];
    
    // Generate profiles for different platforms
    const profiles: SocialProfile[] = [];
    
    // GitHub
    profiles.push({
      platform: "GitHub",
      url: `https://github.com/${usernameFormats[0]}`,
      icon: Github,
      username: usernameFormats[0]
    });
    
    // LinkedIn
    profiles.push({
      platform: "LinkedIn",
      url: `https://www.linkedin.com/in/${usernameFormats[1]}`,
      icon: Linkedin,
      username: usernameFormats[1]
    });
    
    // Instagram
    profiles.push({
      platform: "Instagram",
      url: `https://www.instagram.com/${usernameFormats[2]}`,
      icon: Instagram,
      username: usernameFormats[2]
    });
    
    // Facebook
    profiles.push({
      platform: "Facebook",
      url: `https://www.facebook.com/${usernameFormats[0]}`,
      icon: Facebook,
      username: usernameFormats[0]
    });
    
    // Twitter/X
    profiles.push({
      platform: "Twitter",
      url: `https://twitter.com/${usernameFormats[2]}`,
      icon: Twitter,
      username: usernameFormats[2]
    });
    
    setSocialProfiles(profiles);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Fingerprint className="h-8 w-8 text-teal-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white ml-2">
                OSINT Tool
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Return to Search
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        {studentName ? (
          <div className="bg-white dark:bg-slate-900/60 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <Fingerprint className="h-6 w-6 mr-2 text-teal-500" />
                Social Media for: {studentName}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Here are potential social media profiles based on this name. Note that these are educated guesses 
                and may not represent the actual profiles of the student.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialProfiles.map((profile, index) => (
                <a
                  key={index}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                             rounded-lg hover:shadow-md transition-all hover:border-teal-300 dark:hover:border-teal-700
                             hover:-translate-y-1"
                >
                  <div className="p-2 mr-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <profile.icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {profile.platform}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      <span className="font-mono">@{profile.username}</span>
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2 text-teal-500" />
                </a>
              ))}
            </div>
            
            <div className="mt-6 bg-slate-100 dark:bg-slate-800/60 rounded-lg p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Note:</strong> These profiles are generated based on common username patterns. 
                Always verify identities before making any conclusions.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/60 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="max-w-3xl mx-auto text-center">
              <Fingerprint className="h-16 w-16 mx-auto text-teal-500 mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Open Source Intelligence
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                This tool helps you find potential social media profiles and online presence
                of students based on their names.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Search for a student on the main page first, then click the OSINT button to see
                potential social media profiles for that student.
              </p>
              <Button
                size="lg"
                onClick={() => router.push('/')}
                className="mt-4"
              >
                Return to Search
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
} 