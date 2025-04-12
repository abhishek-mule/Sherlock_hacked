"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Glasses, User, LogOut, Moon, Sun, Camera, History, Lock, Heart, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';
import { signOut } from '@/lib/session';
import { ClientOnly } from '@/components/client-only';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data?.user) {
        console.error('Error getting user:', error);
        router.push('/login');
        return;
      }
      
      setUser(data.user);
      setLoading(false);
    }
    
    getUser();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-teal-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

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
            My Profile
          </h2>
          <p className="text-slate-600 dark:text-slate-400 animate-fadeIn">
            Manage your account and preferences
          </p>
        </div>
        
        <div className="mb-8 bg-white dark:bg-slate-900/80 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 animate-popIn">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white dark:border-slate-900 shadow-md">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.email}&background=0D9488&color=fff&size=128`} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-2xl">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow text-teal-600 dark:text-teal-400">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {user.email}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {user.user_metadata?.role || 'Administrator'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <Button size="sm" variant="outline" className="mobile-ripple">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="account" className="animate-swipeUp">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="account" className="mobile-ripple">Account</TabsTrigger>
            <TabsTrigger value="activity" className="mobile-ripple">Activity</TabsTrigger>
            <TabsTrigger value="security" className="mobile-ripple">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card className="animate-fadeIn">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" placeholder="Enter your name" defaultValue={user.user_metadata?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user.user_metadata?.role || 'Administrator'} disabled />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="mobile-ripple">Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card className="animate-fadeIn">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent actions and searches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-start space-x-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-2">
                        <History className="h-4 w-4 text-teal-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {['Searched for "John Smith"', 'Viewed student details', 'Exported student data'][i]}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {[2, 5, 12][i]} hours ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" className="mobile-ripple">View All Activity</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="animate-fadeIn">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="mobile-ripple">Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
} 