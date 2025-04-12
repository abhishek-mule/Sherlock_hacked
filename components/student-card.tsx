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
  Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

  // Format display name properly
  const displayName = `${name || 'N/A'}${surname ? ' ' + surname : ''}`;

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
          {admissionType && (
            <Badge className="mt-2 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              {admissionType}
            </Badge>
          )}
        </div>
        
        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'basic' 
                ? 'text-teal-600 border-b-2 border-teal-500' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Basic Info
          </button>
          <button 
            onClick={() => setActiveTab('academic')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'academic' 
                ? 'text-teal-600 border-b-2 border-teal-500' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Academic
          </button>
          <button 
            onClick={() => setActiveTab('family')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'family' 
                ? 'text-teal-600 border-b-2 border-teal-500' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Family
          </button>
          <button 
            onClick={() => setActiveTab('other')}
            className={`px-4 py-2 text-sm font-medium ${
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
        <Dialog open={showOsintDialog} onOpenChange={setShowOsintDialog}>
          <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 border-none text-white">
              <Search className="h-4 w-4 mr-2" />
                View Detailed Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold">Student Profile</DialogTitle>
            </DialogHeader>
            
            {!agreedToTerms ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-2 text-amber-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">Please read and agree to the terms before proceeding with student profile access</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm space-y-2">
                  <p>By proceeding, you agree to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use this information ethically and legally</li>
                    <li>Respect privacy and data protection laws</li>
                    <li>Not use the information for harassment or harmful purposes</li>
                    <li>Report any suspicious or concerning findings</li>
                  </ul>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setAgreedToTerms(true)}
                >
                  I Agree to the Terms
                </Button>
              </div>
            ) : (
                <div className="space-y-4">
                  {/* Student Profile Details */}
                  <div className="text-center p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-2xl font-bold mb-2">
                      {name.charAt(0)}{surname ? surname.charAt(0) : ''}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{displayName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
                    
                    <div className="flex justify-center gap-2 mt-4">
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {category}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {religion}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Social Media Links */}
                  <div className="grid grid-cols-2 gap-3">
                {social.github && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(social.github, '_blank')}
                    className="w-full"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                )}
                {social.linkedin && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(social.linkedin, '_blank')}
                    className="w-full"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                {social.twitter && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(social.twitter, '_blank')}
                    className="w-full"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                )}
                {social.instagram && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(social.instagram, '_blank')}
                    className="w-full"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => window.open(`mailto:${email}`)}
                  className="w-full col-span-2"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                  </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
}