"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/tasks');
  }, [router]);

  return (
    <div className="min-h-screen texture-minimal flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="inline-block px-6 py-2 rounded-lg border border-border mb-4">
          <span className="text-sm font-medium text-foreground tracking-wide">Sean&apos;s Claude Code Web Template</span>
        </div>
        <p className="text-muted-foreground mt-2">Taking you to your workspace...</p>
      </div>
    </div>
  );
}

function SignInForm() {
  const router = useRouter();

  return (
    <div className="min-h-screen texture-minimal flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight text-foreground">
            Sean&apos;s Claude Code Web Template
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
            A production-ready template for rapid development
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-minimal rounded-xl p-8 animate-scale-in stagger-2">
          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => router.push('/handler/sign-in')}
            >
              Sign in to continue
            </Button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/handler/sign-up')}
            >
              Create account
            </Button>
          </div>

          {/* Feature List */}
          <div className="mt-8 pt-6 border-t border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span>Clean & minimal interface</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1 h-1 rounded-full bg-accent" />
              <span>Focus on what matters</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1 h-1 rounded-full bg-secondary" />
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

