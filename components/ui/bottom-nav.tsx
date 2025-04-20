import React, { useState, useEffect } from 'react';
import { Home, Search, User, Settings, Menu, Database, Mail, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname() || '';
  
  // Animation variants
  const iconVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.9 },
    active: { 
      scale: 1.1, 
      transition: { type: 'spring', stiffness: 400, damping: 10 } 
    }
  };
  
  const indicatorVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Desktop navigation */}
      <div className="hidden md:block bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname === "/" ? "active" : "initial"}>
                <Link 
                  href="/" 
                  className={`flex items-center space-x-2 transition-colors duration-300 px-3 py-2 rounded-lg ${
                    pathname === "/" 
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Home</span>
                </Link>
              </motion.div>
              
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname === "/search" ? "active" : "initial"}>
                <Link 
                  href="/search" 
                  className={`flex items-center space-x-2 transition-colors duration-300 px-3 py-2 rounded-lg ${
                    pathname === "/search" 
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Search className="h-5 w-5" />
                  <span className="font-medium">Search</span>
                </Link>
              </motion.div>
              
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname === "/admission-search" ? "active" : "initial"}>
                <Link 
                  href="/admission-search" 
                  className={`flex items-center space-x-2 transition-colors duration-300 px-3 py-2 rounded-lg ${
                    pathname === "/admission-search" 
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Database className="h-5 w-5" />
                  <span className="font-medium">Admission Data</span>
                </Link>
              </motion.div>
              
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname.includes("reversecontact-demo") ? "active" : "initial"}>
                <Link 
                  href="/reversecontact-demo" 
                  className={`flex items-center space-x-2 transition-colors duration-300 px-3 py-2 rounded-lg ${
                    pathname.includes("reversecontact-demo")
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">Email Lookup</span>
                </Link>
              </motion.div>

              <motion.div whileTap="tap" variants={iconVariants} animate={pathname === "/api-settings" ? "active" : "initial"}>
                <Link 
                  href="/api-settings" 
                  className={`flex items-center space-x-2 transition-colors duration-300 px-3 py-2 rounded-lg ${
                    pathname === "/api-settings" 
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">API Settings</span>
                </Link>
              </motion.div>
            </div>
            
            <motion.p 
              className="text-sm text-slate-500 dark:text-slate-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              © {new Date().getFullYear()} Sherlock Student Database
            </motion.p>
          </div>
        </div>
      </div>

      {/* Mobile app-like bottom navigation */}
      <div className="md:hidden bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-700 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-lg">
        <div className="grid grid-cols-5 h-16">
          <Link href="/">
            <motion.div 
              className={`flex flex-col items-center justify-center h-full ${
                pathname === "/" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Home className="h-5 w-5" strokeWidth={pathname === "/" ? 2.5 : 2} />
                <AnimatePresence>
                  {pathname === "/" && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={indicatorVariants}
                      layoutId="navIndicatorDot"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs mt-1 font-medium">Home</span>
              {pathname === "/" && (
                <motion.div 
                  className="absolute bottom-0 w-10 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          </Link>
          
          <Link href="/search">
            <motion.div 
              className={`flex flex-col items-center justify-center h-full ${
                pathname === "/search" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Search className="h-5 w-5" strokeWidth={pathname === "/search" ? 2.5 : 2} />
                <AnimatePresence>
                  {pathname === "/search" && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={indicatorVariants}
                      layoutId="navIndicatorDot"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs mt-1 font-medium">Search</span>
              {pathname === "/search" && (
                <motion.div 
                  className="absolute bottom-0 w-10 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          </Link>
          
          <Link href="/admission-search">
            <motion.div 
              className={`flex flex-col items-center justify-center h-full ${
                pathname === "/admission-search" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Database className="h-5 w-5" strokeWidth={pathname === "/admission-search" ? 2.5 : 2} />
                <AnimatePresence>
                  {pathname === "/admission-search" && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={indicatorVariants}
                      layoutId="navIndicatorDot"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs mt-1 font-medium">Admission</span>
              {pathname === "/admission-search" && (
                <motion.div 
                  className="absolute bottom-0 w-10 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          </Link>
          
          <Link href="/reversecontact-demo">
            <motion.div 
              className={`flex flex-col items-center justify-center h-full ${
                pathname.includes("reversecontact-demo") ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Mail className="h-5 w-5" strokeWidth={pathname.includes("reversecontact-demo") ? 2.5 : 2} />
                <AnimatePresence>
                  {pathname.includes("reversecontact-demo") && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={indicatorVariants}
                      layoutId="navIndicatorDot"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs mt-1 font-medium">Email</span>
              {pathname.includes("reversecontact-demo") && (
                <motion.div 
                  className="absolute bottom-0 w-10 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          </Link>
          
          <Link href="/api-settings">
            <motion.div 
              className={`flex flex-col items-center justify-center h-full ${
                pathname === "/api-settings" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Settings className="h-5 w-5" strokeWidth={pathname === "/api-settings" ? 2.5 : 2} />
                <AnimatePresence>
                  {pathname === "/api-settings" && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-500 rounded-full"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={indicatorVariants}
                      layoutId="navIndicatorDot"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs mt-1 font-medium">API</span>
              {pathname === "/api-settings" && (
                <motion.div 
                  className="absolute bottom-0 w-10 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
} 