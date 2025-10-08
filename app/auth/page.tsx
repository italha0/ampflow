"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWhopAuth } from "@whop-apps/nextjs";

export default function AuthPage() {
  const router = useRouter();
  const { user, isLoading, isEmbedded, error, signIn, refresh } = useWhopAuth();
  const [redirectTriggered, setRedirectTriggered] = useState(false);
  const [showManualOption, setShowManualOption] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (isLoading || user || isEmbedded) {
      return;
    }

    if (!redirectTriggered) {
      setRedirectTriggered(true);
      signIn();
    }
  }, [isLoading, user, isEmbedded, redirectTriggered, signIn]);

  useEffect(() => {
    if (!isEmbedded || isLoading || user || showManualOption) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowManualOption(true);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [isEmbedded, isLoading, user, showManualOption]);

  const statusMessage = useMemo(() => {
    if (isLoading) {
      return "Checking your Whop session...";
    }

    if (user) {
      return "Session confirmed. Redirecting to your dashboard...";
    }

    if (isEmbedded) {
      return showManualOption
        ? "We couldn’t confirm your session automatically."
        : "Waiting for Whop to confirm your session...";
    }

    return "Redirecting you to Whop to continue...";
  }, [isLoading, user, isEmbedded, showManualOption]);

  const showManualButton = !isEmbedded || showManualOption || Boolean(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to AmpFlow</h1>
          <p className="text-white/80">Automate your content distribution across platforms</p>
        </div>

        <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <div className="space-y-1">
              <p className="text-white font-semibold">{statusMessage}</p>
              {error ? (
                <p className="text-sm text-white/70">{error.message}</p>
              ) : (
                <p className="text-sm text-white/60">
                  {isEmbedded
                    ? "This page will close once Whop hands us your session."
                    : "You’ll land back here after completing Whop authentication."}
                </p>
              )}
            </div>
          </div>

          {showManualButton && (
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setRedirectTriggered(true);
                  signIn();
                }}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#DD2F6E] to-[#f53c79] hover:from-[#DD2F6E]/90 hover:to-[#f53c79]/90 text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Continue with Whop
              </Button>

              <Button
                onClick={() => {
                  setRedirectTriggered(true);
                  refresh();
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Refresh session
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-white/60">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>
    </div>
  );
}