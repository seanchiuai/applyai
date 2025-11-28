import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import ClientBody from "@/components/ClientBody";

export const metadata: Metadata = {
  title: "Sean's Claude Code Web Template",
  description: "A production-ready Next.js + Convex + Stack Auth template for rapid development",
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
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <ClientBody className="antialiased">
              <ConvexClientProvider>{children}</ConvexClientProvider>
            </ClientBody>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
