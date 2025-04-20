import React from 'react';
import { 
  Mail, 
  User,
  Tag,
  Heart,
  Fingerprint,
  List,
  Hash,
  FileText,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RandomProfilePicture } from './RandomProfilePicture';
import { Student } from '@/lib/supabase';

interface QuickSearchCardProps {
  student: Student;
  onShowDetails: (student: Student) => void;
  onOsintLookup: (student: Student) => void;
}

export function QuickSearchCard({ 
  student,
  onShowDetails,
  onOsintLookup
}: QuickSearchCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-teal-300 dark:hover:border-teal-700">
      {/* Header with key identifiers */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/70 px-4 py-2 rounded-t-xl border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 group-hover:bg-gradient-to-r group-hover:from-teal-50 group-hover:to-cyan-50 dark:group-hover:from-teal-900/20 dark:group-hover:to-cyan-900/20 transition-colors duration-300">
        {student.rollno && (
          <Badge variant="outline" className="px-2 py-0.5 bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30">
            <Hash className="h-3 w-3 mr-1" />
            ID: {student.rollno}
          </Badge>
        )}
        {student.registrationNo && (
          <Badge variant="outline" className="px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
            <FileText className="h-3 w-3 mr-1" />
            Reg: {student.registrationNo}
          </Badge>
        )}
      </div>
        
      <div className="flex items-center p-4 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-teal-50/30 dark:group-hover:from-slate-900 dark:group-hover:to-teal-900/10">
        {/* Profile Picture */}
        <div className="h-16 w-16 rounded-full border-2 border-teal-500 overflow-hidden bg-white flex-shrink-0 shadow-md group-hover:shadow-teal-300/30 dark:group-hover:shadow-teal-700/30 transition-all duration-300 group-hover:scale-105">
          {typeof student.image_url === 'string' ? (
            <img 
              src={student.image_url} 
              alt={`${student.name} ${student.surname}`} 
              className="h-full w-full object-cover"
              onError={(e) => {
                // If image fails to load, switch to RandomProfilePicture
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <RandomProfilePicture
              seed={typeof student.image_url === 'object' && student.image_url !== null ? student.image_url.seed : student.name}
              gender={typeof student.image_url === 'object' && student.image_url !== null ? (student.image_url.gender as 'Male' | 'Female') : (student.gender as 'Male' | 'Female')}
              size={64}
              alt={`${student.name} ${student.surname}`}
              className="h-full w-full"
            />
          )}
        </div>

        {/* Student Basic Info */}
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-cyan-600 dark:group-hover:from-teal-300 dark:group-hover:to-cyan-300 transition-all duration-300">
              {student.name} {student.surname}
            </h3>
          </div>

          {/* Email */}
          {student.email && (
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 truncate mb-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-300">
              <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Info Section */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 group-hover:bg-teal-50/50 dark:group-hover:bg-teal-900/10 transition-colors duration-300">
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {/* Father's Name */}
          <div className="flex items-start gap-1.5 group/item hover:bg-white dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-full group-hover/item:bg-indigo-200 dark:group-hover/item:bg-indigo-800/50 transition-colors duration-300">
              <User className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Father&apos;s Name</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{student.father_name || 'Not available'}</p>
            </div>
          </div>
          
          {/* Category */}
          <div className="flex items-start gap-1.5 group/item hover:bg-white dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
            <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded-full group-hover/item:bg-violet-200 dark:group-hover/item:bg-violet-800/50 transition-colors duration-300">
              <Tag className="h-3 w-3 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Category</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{student.category || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Religion */}
          <div className="flex items-start gap-1.5 group/item hover:bg-white dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
            <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-full group-hover/item:bg-rose-200 dark:group-hover/item:bg-rose-800/50 transition-colors duration-300">
              <Heart className="h-3 w-3 text-rose-500 dark:text-rose-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Religion</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{student.religion || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Sub-caste */}
          <div className="flex items-start gap-1.5 group/item hover:bg-white dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full group-hover/item:bg-amber-200 dark:group-hover/item:bg-amber-800/50 transition-colors duration-300">
              <Users className="h-3 w-3 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Sub-caste</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{student.subcast || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex justify-between bg-white dark:bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-teal-50 dark:group-hover:from-slate-900 dark:group-hover:to-teal-900/10 transition-colors duration-300">
        <Button
          onClick={() => onShowDetails(student)}
          size="sm" 
          variant="outline"
          className="text-xs border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-800 transition-colors duration-300"
        >
          <List className="h-3 w-3 mr-1" />
          More Details
        </Button>
        
        <Button
          onClick={() => onOsintLookup(student)}
          size="sm" 
          variant="outline"
          className="text-xs border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-300"
          disabled={!student.email}
        >
          <Fingerprint className="h-3 w-3 mr-1" />
          OSINT Lookup
        </Button>
      </div>
    </div>
  );
} 