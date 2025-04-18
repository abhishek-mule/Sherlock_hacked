import React from 'react';
import { Home, Search, User, Settings, Menu, Database, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname() || '';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
      {/* Desktop navigation */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className={`flex items-center space-x-2 transition-colors ${
                  pathname === "/" 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link 
                href="/search" 
                className={`flex items-center space-x-2 transition-colors ${
                  pathname === "/search" 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <Search className="h-5 w-5" />
                <span className="font-medium">Search</span>
              </Link>
              
              <Link 
                href="/admission-search" 
                className={`flex items-center space-x-2 transition-colors ${
                  pathname === "/admission-search" 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <Database className="h-5 w-5" />
                <span className="font-medium">Admission Data</span>
              </Link>
              
              <Link 
                href="/reversecontact-demo" 
                className={`flex items-center space-x-2 transition-colors ${
                  pathname.includes("reversecontact-demo")
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <Mail className="h-5 w-5" />
                <span className="font-medium">Email Lookup</span>
              </Link>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Sherlock Student Database
            </p>
          </div>
        </div>
      </div>

      {/* Mobile app-like bottom navigation */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="grid grid-cols-5 h-16">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center ${
              pathname === "/" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            href="/search" 
            className={`flex flex-col items-center justify-center ${
              pathname === "/search" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          
          <Link 
            href="/admission-search" 
            className={`flex flex-col items-center justify-center ${
              pathname === "/admission-search" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Database className="h-5 w-5" />
            <span className="text-xs mt-1">Admission</span>
          </Link>
          
          <Link 
            href="/reversecontact-demo" 
            className={`flex flex-col items-center justify-center ${
              pathname.includes("reversecontact-demo") ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs mt-1">Email</span>
          </Link>
          
          <Link 
            href="/settings" 
            className={`flex flex-col items-center justify-center ${
              pathname === "/settings" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 