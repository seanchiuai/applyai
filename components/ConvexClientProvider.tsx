"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { stackClientApp } from "../stack/client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
convex.setAuth(stackClientApp.getConvexClientAuth({}));

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
