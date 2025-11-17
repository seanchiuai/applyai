import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import ClientBody from "@/components/ClientBody";

export const metadata: Metadata = {
  title: "VIBED - Minimalist Task Management",
  description: "Simple, beautiful task management that sparks joy",
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
      <body suppressHydrationWarning>
        <ClientBody className="antialiased">
          <ClerkProvider
            dynamic
            appearance={{
              layout: {
                unsafe_disableDevelopmentModeWarnings: true,
              },
              elements: {
                card: "glass border border-border",
                headerTitle: "text-foreground font-bold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all",
                formButtonPrimary: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all",
                formFieldInput: "bg-input border border-border text-foreground rounded-xl focus:border-primary transition-colors placeholder:text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/80 transition-colors",
                formFieldLabel: "text-foreground",
                formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                formHeaderTitle: "text-foreground",
                formHeaderSubtitle: "text-muted-foreground",
                socialButtonsBlockButtonText: "text-foreground",
                formFieldSuccessText: "text-secondary",
                formFieldErrorText: "text-destructive",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/80",
              }
            }}
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        </ClientBody>
      </body>
    </html>
  );
}
