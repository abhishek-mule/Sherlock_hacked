import React from 'react';
import { Home, Search, User, Settings, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  
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
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Sherlock Student Database
            </p>
          </div>
        </div>
      </div>

      {/* Mobile app-like bottom navigation */}
      <div className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 shadow-lg">
        <nav className="flex items-center justify-around py-3 px-2">
          <Link
            href="/"
            className={`mobile-ripple flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-xl transition-colors ${
              pathname === "/"
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Home
              className={`w-6 h-6 mb-1 transition-all ${
                pathname === "/" ? "stroke-[2.5px]" : "stroke-[1.5px]"
              }`}
            />
            <span className="text-xs font-medium">Home</span>
            {pathname === "/" && (
              <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
            )}
          </Link>
          
          <Link
            href="/search"
            className={`mobile-ripple flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-xl transition-colors ${
              pathname === "/search"
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Search
              className={`w-6 h-6 mb-1 transition-all ${
                pathname === "/search" ? "stroke-[2.5px]" : "stroke-[1.5px]"
              }`}
            />
            <span className="text-xs font-medium">Search</span>
            {pathname === "/search" && (
              <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
            )}
          </Link>
          
          {/* Floating Action Button */}
          <div className="relative -mt-8">
            <Link
              href="/profile"
              className="mobile-ripple flex flex-col items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-full shadow-lg"
            >
              <User className="w-7 h-7" />
              <span className="sr-only">Profile</span>
            </Link>
          </div>
          
          <Link
            href="/settings"
            className={`mobile-ripple flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-xl transition-colors ${
              pathname === "/settings"
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Settings
              className={`w-6 h-6 mb-1 transition-all ${
                pathname === "/settings" ? "stroke-[2.5px]" : "stroke-[1.5px]"
              }`}
            />
            <span className="text-xs font-medium">Settings</span>
            {pathname === "/settings" && (
              <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
            )}
          </Link>
          
          <Link
            href="/menu"
            className={`mobile-ripple flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-xl transition-colors ${
              pathname === "/menu"
                ? "text-teal-600 dark:text-teal-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Menu
              className={`w-6 h-6 mb-1 transition-all ${
                pathname === "/menu" ? "stroke-[2.5px]" : "stroke-[1.5px]"
              }`}
            />
            <span className="text-xs font-medium">Menu</span>
            {pathname === "/menu" && (
              <div className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
            )}
          </Link>
        </nav>
      </div>
    </div>
  );
} 