"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { useUser } from "@stackframe/stack";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function useStackAuth() {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(!user && user !== null);
  }, [user]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) {
        return null;
      }
      try {
        const { accessToken } = await user.getAuthJson();
        return accessToken;
      } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
      }
    },
    [user]
  );

  return {
    isLoading,
    isAuthenticated: !!user,
    fetchAccessToken,
  };
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useStackAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
