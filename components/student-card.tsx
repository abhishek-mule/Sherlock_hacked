"use client";

import { useState } from 'react';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Instagram, 
  Search,
  AlertCircle,
  User,
  BookOpen,
  Briefcase,
  Users,
  Heart,
  Tag,
  Fingerprint
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { performOSINTLookup } from './OSINTDashboard';
import OsintPopup from './OsintPopup';

interface StudentInfo {
  name: string;
  surname: string;
  image: string;
  email: string;
  fatherName: string;
  occupation: string;
  category: string;
  religion: string;
  subcast: string;
  rollno?: string;
  registrationNo?: string;
  enrollmentNumber?: string;
  admissionType?: string;
  mobileNo?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  socialCategory?: string;
  adhaarNo?: string;
  motherName?: string;
  motherOccupation?: string;
  annualFamilyIncome?: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

interface StudentCardProps extends StudentInfo {}

export function StudentCard({ 
  name = 'N/A', 
  surname = '',
  image = 'https://i.pravatar.cc/150?img=1', 
  email = 'No email provided', 
  fatherName = 'Not available',
  occupation = 'Not specified',
  category = 'Not specified',
  religion = 'Not specified',
  subcast = 'Not specified',
  rollno = '',
  registrationNo = '',
  enrollmentNumber = '',
  admissionType = '',
  mobileNo = '',
  dob = '',
  gender = '',
  nationality = '',
  bloodGroup = '',
  maritalStatus = '',
  socialCategory = '',
  adhaarNo = '',
  motherName = '',
  motherOccupation = '',
  annualFamilyIncome = '',
  social = {}
}: StudentCardProps) {
  const [showOsintDialog, setShowOsintDialog] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic'|'academic'|'family'|'other'>('basic');
  const [osintData, setOsintData] = useState<any>(null);
  const [osintLoading, setOsintLoading] = useState(false);

  // Format display name properly
  const displayName = `${name || 'N/A'}${surname ? ' ' + surname : ''}`;

  // Add function to handle OSINT lookup
  const handleOsintLookup = async () => {
    if (!email || email === 'No email provided') {
      alert('No email available for OSINT lookup');
      return;
    }

    // Simply open the OsintPopup
    setShowOsintDialog(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800">
      <div className="p-6">
        {/* Student Name Header with ID info */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
              {displayName}
            </h3>
            {registrationNo && (
              <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                Reg: {registrationNo}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400">{email}</p>
            {rollno && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Roll No: {rollno}</p>
            )}
          </div>
          {enrollmentNumber && (
            <p className="text-xs text-slate-500 mt-1">Enrollment: {enrollmentNumber}</p>
          )}
          <div className="flex justify-between items-center mt-2">
            {admissionType && (
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                {admissionType}
              </Badge>
            )}
            {email && email !== 'No email provided' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 gap-1"
                onClick={() => setShowOsintDialog(true)}
              >
                <Fingerprint className="h-4 w-4" />
                OSINT
              </Button>
            )}
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'basic' 
                ? 'text-teal-600 border-b-2 border-teal-500' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Basic Info
          </button>
          <button 
            onClick={() => setActiveTab('academic')}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'academic' 
                ? 'text-teal-600 border-b-2 border-teal-500' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Academic
          </button>
          <button 
            onClick={() => setActiveTab('family')}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'family' 
                ? 'text-teal-600 border-b-2 border-teal-500' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Family
          </button>
          <button 
            onClick={() => setActiveTab('other')}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'other' 
                ? 'text-teal-600 border-b-2 border-teal-500' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Other
          </button>
        </div>
        
        {/* Tab content */}
        <div className="mb-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mobileNo && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Users className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Mobile No</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{mobileNo}</p>
                  </div>
                </div>
              )}
              
              {dob && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Users className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Date of Birth</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{dob}</p>
                  </div>
                </div>
              )}
              
              {gender && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Users className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gender</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{gender}</p>
                  </div>
                </div>
              )}
              
              {nationality && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Users className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Nationality</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{nationality}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <Heart className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Religion</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{religion}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <Tag className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{category}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <Tag className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sub-caste</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{subcast}</p>
                </div>
              </div>
              
              {bloodGroup && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Users className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Blood Group</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{bloodGroup}</p>
                  </div>
                </div>
              )}
              
              {maritalStatus && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Users className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Marital Status</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{maritalStatus}</p>
                  </div>
                </div>
              )}
              
              {adhaarNo && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Aadhaar No</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{adhaarNo}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Family Info Tab */}
          {activeTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <User className="h-4 w-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Father&apos;s Name</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{fatherName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  <Briefcase className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Father&apos;s Occupation</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{occupation}</p>
                </div>
              </div>
              
              {motherName && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <User className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Mother&apos;s Name</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{motherName}</p>
                  </div>
                </div>
              )}
              
              {motherOccupation && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Briefcase className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Mother&apos;s Occupation</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{motherOccupation}</p>
                  </div>
                </div>
              )}
              
              {annualFamilyIncome && (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                    <Briefcase className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Annual Family Income</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{annualFamilyIncome}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Academic Info Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-2 text-center py-4">
              <p className="text-slate-500 dark:text-slate-400">Academic details available in full profile</p>
              <Button 
                onClick={() => setShowOsintDialog(true)}
                variant="outline" 
                className="mt-2"
              >
                View Full Profile
              </Button>
            </div>
          )}
          
          {/* Other Info Tab */}
          {activeTab === 'other' && (
            <div className="space-y-2 text-center py-4">
              <p className="text-slate-500 dark:text-slate-400">Additional information available in full profile</p>
              <Button 
                onClick={() => setShowOsintDialog(true)}
                variant="outline" 
                className="mt-2"
              >
                View Full Profile
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 border-none text-white"
            onClick={() => setShowOsintDialog(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            View Detailed Profile
          </Button>
          
          {/* Social Media Links if available */}
          {(social.github || social.linkedin || social.twitter || social.instagram) && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Github className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Twitter className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <Instagram className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* OSINT Popup */}
      <OsintPopup
        isOpen={showOsintDialog}
        onClose={() => setShowOsintDialog(false)}
        email={email}
      />
    </div>
  );
}