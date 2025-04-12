"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Glasses, Mail, Lock, Loader2, Moon, Sun, User } from "lucide-react";
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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Form validation
      if (!name.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter your name.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error("Registration error:", error.message);
        toast({
          title: "Registration Failed",
          description: error.message || "An unexpected error occurred during registration.",
          variant: "destructive",
        });
        return;
      }

      // Registration successful
      toast({
        title: "Registration Successful",
        description: "Please check your email for a verification link. You must verify your email before you can log in.",
      });
      
      // Create a student record
      const { error: studentError } = await supabase
        .from('student_data')
        .insert([{ 
          name, 
          email,
          surname: "",
          father_name: "",
          occupation: "",
          category: "",
          religion: "",
          subcast: "",
          image_url: "",
        }]);

      if (studentError) {
        console.error("Student record creation error:", studentError.message);
      }

      // Redirect to the verification notification page with the email parameter
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Registration exception:", error);
      toast({
        title: "Error",
        description: "A system error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-slate-400">Register to access Sherlock</p>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/20"
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="text-teal-400 hover:text-teal-300 p-0"
                onClick={() => router.push("/login")}
              >
                Sign in
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