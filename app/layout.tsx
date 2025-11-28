import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import ClientBody from "@/components/ClientBody";

export const metadata: Metadata = {
  title: "Sean's Claude Code Web Template",
  description: "A production-ready Next.js + Convex + Clerk template for rapid development",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning><StackProvider app={stackClientApp}><StackTheme>
        <ClientBody className="antialiased">
          <ClerkProvider
            dynamic
            appearance={{
              layout: {
                unsafe_disableDevelopmentModeWarnings: true,
              },
              elements: {
                card: "card-minimal",
                headerTitle: "text-foreground font-bold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border border-border hover:border-primary/50 hover:bg-muted/20 transition-all rounded-lg",
                formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-lg",
                formFieldInput: "bg-input border border-border text-foreground rounded-lg focus:border-primary transition-colors placeholder:text-muted-foreground",
                footerActionLink: "text-primary hover:opacity-80 transition-colors",
                formFieldLabel: "text-foreground font-medium",
                formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground text-xs",
                formHeaderTitle: "text-foreground",
                formHeaderSubtitle: "text-muted-foreground",
                socialButtonsBlockButtonText: "text-foreground",
                formFieldSuccessText: "text-accent",
                formFieldErrorText: "text-destructive",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:opacity-80",
              }
            }}
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        </ClientBody>
      </StackTheme></StackProvider></body>
    </html>
  );
}
