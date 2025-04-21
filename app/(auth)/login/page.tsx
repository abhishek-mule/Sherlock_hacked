"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Glasses, Mail, Lock, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/client-only";

// Add dynamic rendering config
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "";
  const errorCode = searchParams?.get("error_code") || "";
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Check for errors in URL parameters (e.g., from expired verification links)
  useEffect(() => {
    if (error === "access_denied" && errorCode === "otp_expired") {
      toast({
        title: "Verification Link Expired",
        description: "Your verification link has expired. Please request a new one.",
        variant: "destructive",
      });
    }
  }, [error, errorCode, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First check if the email is in a valid format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if the password is at least 6 characters
      if (password.length < 6) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        
        // Check specifically for email verification errors
        if (error.message.includes("Email not confirmed") || error.message.includes("not confirmed")) {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and click the verification link to activate your account.",
            variant: "destructive",
          });
          // Redirect to verification page instead of just sending a new email
          router.push(`/verify?email=${encodeURIComponent(email)}`);
          return;
        } else if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Access Denied",
            description: "The email or password you entered is incorrect.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message || "An unexpected error occurred during login.",
            variant: "destructive",
          });
        }
        return;
      }

      if (!data.user) {
        toast({
          title: "Login Failed",
          description: "No user found with these credentials.",
          variant: "destructive",
        });
        return;
      }

      // Success - login successful
      toast({
        title: "Welcome back!",
        description: "Successfully logged into Sherlock",
      });
      router.push("/");
    } catch (error) {
      console.error("Login exception:", error);
      toast({
        title: "Error",
        description: "A system error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to resend verification email
  const resendVerificationEmail = async () => {
    try {
      if (!email) {
        toast({
          title: "Email Required",
          description: "Please enter your email address first.",
          variant: "destructive",
        });
        return;
      }

      // Redirect to the verification page instead
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Resend verification exception:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <ClientOnly>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </ClientOnly>
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full backdrop-blur-sm mb-4 animate-float">
            <Glasses className="h-12 w-12 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Sherlock</h1>
          <p className="text-slate-400">Sign in to continue to your dashboard</p>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Button 
                  variant="link" 
                  className="text-sm text-teal-400 hover:text-teal-300 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    if (email) {
                      resendVerificationEmail();
                    } else {
                      toast({
                        title: "Email Required",
                        description: "Please enter your email address first.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Verify Email
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/20"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Button 
                variant="link" 
                className="text-teal-400 hover:text-teal-300 p-0"
                onClick={() => router.push("/register")}
              >
                Create account
              </Button>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}