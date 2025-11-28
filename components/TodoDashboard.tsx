"use client";

import { useState } from "react";
import CreditCardForm from "@/components/CreditCardForm";

export default function TodoDashboard() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<"idle" | "success" | "error">("idle");

  const handleLaunchBrowserUse = async () => {
    setIsLaunching(true);
    setLaunchStatus("idle");

    try {
      const response = await fetch("/api/browser-use/launch", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setLaunchStatus("success");
      } else {
        setLaunchStatus("error");
      }
    } catch {
      setLaunchStatus("error");
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-12 animate-fade-in text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Apply to Colleges</h1>
        <p className="text-muted-foreground text-base">Complete these steps to start your automated application</p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {/* Step 1: Payment Settings */}
        <div className="card-minimal rounded-xl p-8 animate-scale-in stagger-1">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">1</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Enter Payment Information</h2>
              <p className="text-muted-foreground mb-5">
                Save your credit card securely for application fees. Your card is encrypted and stored safely.
              </p>
              <CreditCardForm />
            </div>
          </div>
        </div>

        {/* Step 2: Launch Browser Use */}
        <div className="card-minimal rounded-xl p-8 animate-scale-in stagger-2">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">2</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Launch Automated Applications</h2>
              <p className="text-muted-foreground mb-5">
                Start the browser automation to automatically fill out and submit your college applications.
              </p>
              <button
                onClick={handleLaunchBrowserUse}
                disabled={isLaunching}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLaunching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Apply to Colleges
                  </>
                )}
              </button>

              {/* Status Messages */}
              {launchStatus === "success" && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 text-accent flex items-center gap-2 animate-fade-in">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Browser automation started! Check your browser window.
                </div>
              )}

              {launchStatus === "error" && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2 animate-fade-in">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Failed to start automation. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}