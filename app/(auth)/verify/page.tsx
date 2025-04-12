"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Glasses, Mail, Loader2, Moon, Sun, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { ClientOnly } from "@/components/client-only";

// Add dynamic rendering config
export const dynamic = 'force-dynamic';

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const error = searchParams.get("error") || "";
  const errorCode = searchParams.get("error_code") || "";
  const errorDescription = searchParams.get("error_description") || "";
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Check for expired OTP error in URL
    if (
      error === "access_denied" && 
      (errorCode === "otp_expired" || errorDescription.includes("expired") || errorDescription.includes("invalid"))
    ) {
      setIsExpired(true);
      toast({
        title: "Verification Link Expired",
        description: "Your verification link has expired. Please request a new one.",
        variant: "destructive",
      });
    }
  }, [error, errorCode, errorDescription, toast]);

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "No email address found to send verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification email.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verification Email Sent",
        description: "We've sent a new verification email. Please check your inbox.",
      });
      setIsExpired(false);
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
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
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-slate-400">
            {isExpired 
              ? "Your verification link has expired" 
              : "Please check your inbox to confirm your account"
            }
          </p>
        </div>

        <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
          <div className="text-center space-y-6">
            <div className="mx-auto rounded-full bg-teal-500/20 p-4 inline-flex">
              {isExpired ? (
                <AlertTriangle className="h-12 w-12 text-yellow-400" />
              ) : (
                <Mail className="h-12 w-12 text-teal-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                {isExpired ? "Verification Link Expired" : "Verification Email Sent"}
              </h2>
              
              {email && (
                <p className="text-slate-400">
                  {isExpired ? "The link sent to " : "We've sent a verification link to "}
                  <span className="text-teal-400">{email}</span>
                  {isExpired ? " has expired." : ""}
                </p>
              )}
              
              <p className="text-slate-400">
                {isExpired 
                  ? "Please request a new verification email using the button below."
                  : "Please click the link in the email to verify your account and continue."
                }
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <Button
                variant={isExpired ? "default" : "outline"}
                className={isExpired 
                  ? "bg-teal-500 hover:bg-teal-600 text-white" 
                  : "border-teal-500/30 hover:bg-teal-500/20 text-teal-400"
                }
                onClick={handleResendVerification}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  isExpired ? "Send New Verification Email" : "Resend Verification Email"
                )}
              </Button>
              
              <div className="pt-2">
                <Button
                  variant="link"
                  className="text-slate-400 hover:text-white"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Already verified? <Button variant="link" className="p-0 text-teal-400" onClick={() => router.push("/login")}>Sign in</Button></p>
        </div>
      </div>
    </div>
  );
} 