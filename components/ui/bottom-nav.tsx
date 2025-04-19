import React, { useState, useEffect } from 'react';
import { Home, Search, User, Settings, Menu, Database, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname() || '';
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  // Handle scroll behavior for desktop only (mobile will always show nav)
  useEffect(() => {
    const handleScroll = () => {
      // Don't hide on mobile devices
      if (window.innerWidth < 768) return;
      
      const currentScrollPos = window.scrollY;
      const isScrollingDown = currentScrollPos > prevScrollPos;
      
      // Only hide when scrolling down and not at the top or bottom of the page
      setVisible(!isScrollingDown || currentScrollPos < 50 || 
                (window.innerHeight + currentScrollPos) >= document.body.scrollHeight - 50);
      
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);
  
  // Animation variants
  const navVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hidden: { opacity: 0, y: 100, transition: { duration: 0.3 } }
  };

  const iconVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.9 },
    active: { 
      scale: 1.1, 
      transition: { type: 'spring', stiffness: 400, damping: 10 } 
    }
  };
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom"
      initial="visible"
      animate={visible ? "visible" : "hidden"}
      variants={navVariants}
    >
      {/* Desktop navigation */}
      <div className="hidden md:block bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname === "/" ? "active" : "initial"}>
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
              </motion.div>
              
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname === "/search" ? "active" : "initial"}>
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
              </motion.div>
              
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname === "/admission-search" ? "active" : "initial"}>
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
              </motion.div>
              
              <motion.div whileTap="tap" variants={iconVariants} animate={pathname.includes("reversecontact-demo") ? "active" : "initial"}>
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
              </motion.div>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Sherlock Student Database
            </p>
          </div>
        </div>
      </div>

      {/* Mobile app-like bottom navigation */}
      <div className="md:hidden bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700 shadow-lg backdrop-blur-md">
        <div className="grid grid-cols-5 h-16">
          <Link href="/">
            <motion.div 
              className={`flex flex-col items-center justify-center h-full ${
                pathname === "/" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
              whileTap={{ scale: 0.9 }}
              animate={pathname === "/" ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
              {pathname === "/" && (
                <motion.div 
                  className="absolute bottom-0 w-5 h-1 bg-teal-500 rounded-t-full"
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
              animate={pathname === "/search" ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs mt-1">Search</span>
              {pathname === "/search" && (
                <motion.div 
                  className="absolute bottom-0 w-5 h-1 bg-teal-500 rounded-t-full"
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
              animate={pathname === "/admission-search" ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Database className="h-5 w-5" />
              <span className="text-xs mt-1">Admission</span>
              {pathname === "/admission-search" && (
                <motion.div 
                  className="absolute bottom-0 w-5 h-1 bg-teal-500 rounded-t-full"
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
              animate={pathname.includes("reversecontact-demo") ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Mail className="h-5 w-5" />
              <span className="text-xs mt-1">Email</span>
              {pathname.includes("reversecontact-demo") && (
                <motion.div 
                  className="absolute bottom-0 w-5 h-1 bg-teal-500 rounded-t-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          </Link>
          
          <Link href="/settings">
            <motion.div 
              className={`flex flex-col items-center justify-center h-full ${
                pathname === "/settings" ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
              whileTap={{ scale: 0.9 }}
              animate={pathname === "/settings" ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Settings</span>
              {pathname === "/settings" && (
                <motion.div 
                  className="absolute bottom-0 w-5 h-1 bg-teal-500 rounded-t-full"
                  layoutId="navIndicator"
                />
              )}
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 