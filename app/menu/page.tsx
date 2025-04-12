"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Glasses, LogOut, Moon, Sun, Settings, User, Home, Search, HelpCircle, Download, Share2, BookOpen, FileText, Database, Shield, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from '@/components/ui/use-toast';
import { signOut } from '@/lib/session';
import { ClientOnly } from '@/components/client-only';
import { BottomNav } from '@/components/ui/bottom-nav';

export default function MenuPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const success = await signOut();
      if (success) {
        router.push('/login');
      } else {
        toast({
          title: "Logout Failed",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { 
      icon: <Home className="h-5 w-5" />, 
      label: "Home", 
      description: "Return to the main search page",
      action: () => router.push('/'),
      color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" 
    },
    { 
      icon: <Search className="h-5 w-5" />, 
      label: "Search", 
      description: "Search for students",
      action: () => router.push('/search'),
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" 
    },
    { 
      icon: <User className="h-5 w-5" />, 
      label: "Profile", 
      description: "View and edit your profile",
      action: () => router.push('/profile'),
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
    },
    { 
      icon: <Settings className="h-5 w-5" />, 
      label: "Settings", 
      description: "Configure app preferences",
      action: () => router.push('/settings'),
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
    },
    { 
      icon: <Database className="h-5 w-5" />, 
      label: "Data Management", 
      description: "Import and export data",
      action: () => toast({
        title: "Coming Soon",
        description: "This feature will be available in a future update.",
      }),
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
    },
    { 
      icon: <BookOpen className="h-5 w-5" />, 
      label: "Documentation", 
      description: "Learn how to use the app",
      action: () => toast({
        title: "Coming Soon",
        description: "Documentation will be available soon.",
      }),
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
    },
    { 
      icon: <HelpCircle className="h-5 w-5" />, 
      label: "Help & Support", 
      description: "Get assistance",
      action: () => toast({
        title: "Support",
        description: "Please contact support@example.com for assistance.",
      }),
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
    },
    { 
      icon: <Shield className="h-5 w-5" />, 
      label: "Privacy Policy", 
      description: "Read our privacy policy",
      action: () => toast({
        title: "Privacy Policy",
        description: "Our privacy policy will open in a new tab.",
      }),
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200 mobile-scrollview pb-28">
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-all duration-200 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <div className="flex items-center flex-shrink-0 mobile-ripple p-2 rounded-full" onClick={() => router.push('/')}>
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg">
                  <Glasses className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white ml-2">
                  Sherlock
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="mobile-ripple rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ClientOnly>
                  {theme === "dark" ? 
                    <Sun className="h-5 w-5 text-amber-500" /> : 
                    <Moon className="h-5 w-5 text-slate-700" />
                  }
                </ClientOnly>
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-700 dark:text-slate-200 hidden sm:flex mobile-ripple"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="mobile-ripple rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 animate-fadeIn">
            Menu
          </h2>
          <p className="text-slate-600 dark:text-slate-400 animate-fadeIn">
            Browse all app features and options
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-swipeUp">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="p-4 hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 mobile-ripple cursor-pointer animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={item.action}
            >
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-600" />
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col items-center animate-swipeUp" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Sherlock Student Finder v1.0
          </p>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="mobile-ripple w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
} 