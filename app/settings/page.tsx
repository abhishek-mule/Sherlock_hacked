"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Glasses, LogOut, Moon, Sun, BellRing, Globe, Eye, AlertCircle, Monitor, Laptop, Smartphone, Download, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from '@/components/ui/use-toast';
import { signOut } from '@/lib/session';
import { ClientOnly } from '@/components/client-only';
import { BottomNav } from '@/components/ui/bottom-nav';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [dataCache, setDataCache] = useState(true);
  const [accessibility, setAccessibility] = useState(true);
  const [fontScale, setFontScale] = useState([1]);
  const [language, setLanguage] = useState("english");

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

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const clearData = () => {
    toast({
      title: "Data Cleared",
      description: "Your cached data has been cleared.",
    });
  };

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
            Settings
          </h2>
          <p className="text-slate-600 dark:text-slate-400 animate-fadeIn">
            Configure your preferences and app settings
          </p>
        </div>

        <div className="space-y-6 animate-swipeUp">
          {/* Appearance Settings */}
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-teal-500" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme" className="text-base">Theme</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                  <button 
                    onClick={() => setTheme("light")}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full mobile-ripple ${
                      theme === "light" 
                        ? "bg-white dark:bg-slate-700 shadow text-teal-600 dark:text-teal-400" 
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full mobile-ripple ${
                      theme === "dark" 
                        ? "bg-white dark:bg-slate-700 shadow text-teal-600 dark:text-teal-400" 
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme("system")}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full mobile-ripple ${
                      theme === "system" 
                        ? "bg-white dark:bg-slate-700 shadow text-teal-600 dark:text-teal-400" 
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Font Size</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Adjust the text size throughout the app
                  </p>
                </div>
                <div className="w-[180px]">
                  <Slider
                    defaultValue={fontScale}
                    max={2}
                    min={0.8}
                    step={0.1}
                    onValueChange={setFontScale}
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>A</span>
                    <span className="text-base">A</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Accessibility Mode</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Simplify the interface for screen readers
                  </p>
                </div>
                <Switch
                  checked={accessibility}
                  onCheckedChange={setAccessibility}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-teal-500" />
                Language & Region
              </CardTitle>
              <CardDescription>
                Configure language and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language" className="text-base">Language</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Choose your preferred language
                  </p>
                </div>
                <Select defaultValue={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellRing className="h-5 w-5 mr-2 text-teal-500" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Notifications</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive updates and alerts
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              {notifications && (
                <div className="pt-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">New student updates</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Security alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">System notifications</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-teal-500" />
                Data Management
              </CardTitle>
              <CardDescription>
                Manage your data and caching preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Cache Student Data</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Store data locally for faster access
                  </p>
                </div>
                <Switch
                  checked={dataCache}
                  onCheckedChange={setDataCache}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button variant="outline" className="mobile-ripple" onClick={clearData}>
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                Clear Cache
              </Button>
              <Button variant="outline" className="mobile-ripple">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardFooter>
          </Card>

          {/* About & Support */}
          <Card className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-teal-500" />
                About & Support
              </CardTitle>
              <CardDescription>
                App information and help resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">App Version</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sherlock v1.0.0</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Support</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  For assistance, please contact <a href="mailto:support@example.com" className="text-teal-600 dark:text-teal-400">support@example.com</a>
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex flex-col w-full space-y-2">
                <Button variant="outline" className="w-full mobile-ripple">
                  Help Center
                </Button>
                <Button variant="outline" className="w-full mobile-ripple">
                  Privacy Policy
                </Button>
              </div>
            </CardFooter>
          </Card>

          <div className="pt-4 pb-10 flex justify-end">
            <Button onClick={saveSettings} className="mobile-ripple">
              Save Settings
            </Button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
} 