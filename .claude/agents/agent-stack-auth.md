---
name: "Stack Auth Authentication Setup"
description: "Set up Stack Auth authentication for your application"
tools: ["npm", "filesystem", "env"]
color: purple
---

# Stack Auth Authentication Agent

## Mission
Set up Stack Auth authentication system with login, signup, and user management integrated with Convex.

## Implementation Steps

### 1. Install Stack Auth
```bash
npm install @stackframe/stack
```

### 2. Set Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_STACK_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=<your-publishable-client-key>
STACK_SECRET_SERVER_KEY=<your-secret-server-key>
```

### 3. Create Stack Client/Server Apps
Create `/stack/client.tsx`:
```tsx
import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
});
```

Create `/stack/server.tsx`:
```tsx
import "server-only";
import { StackServerApp } from "@stackframe/stack";
import { stackClientApp } from "./client";

export const stackServerApp = new StackServerApp({
  inheritsFrom: stackClientApp,
});
```

### 4. Configure Providers
Update root layout with StackProvider and StackTheme:
```tsx
<StackProvider app={stackClientApp}>
  <StackTheme>
    {children}
  </StackTheme>
</StackProvider>
```

### 5. Set Up Auth Handlers
Create `/app/handler/[...stack]/page.tsx`:
```tsx
import { StackHandler } from "@stackframe/stack";

export default function Handler() {
  return <StackHandler fullPage />;
}
```

### 6. Configure Convex Integration
Update `convex/auth.config.ts`:
```tsx
import { getConvexProvidersConfig } from "@stackframe/stack";

export default {
  providers: getConvexProvidersConfig({
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  }),
};
```

Update `convex/convex.config.ts`:
```tsx
import stackAuthComponent from "@stackframe/stack/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(stackAuthComponent);

export default app;
```

Set Convex auth in ConvexClientProvider:
```tsx
convex.setAuth(stackClientApp.getConvexClientAuth({}));
```

### 7. Protect Routes
Update `middleware.ts`:
```tsx
import { stackServerApp } from "@/stack/server";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const user = await stackServerApp.getUser();

  if (req.nextUrl.pathname.startsWith("/protected") && !user) {
    return NextResponse.redirect(new URL("/handler/sign-in", req.url));
  }

  return NextResponse.next();
}
```

## Files to Create/Modify
- `/stack/client.tsx`
- `/stack/server.tsx`
- `app/handler/[...stack]/page.tsx`
- `app/layout.tsx`
- `components/ConvexClientProvider.tsx`
- `middleware.ts`
- `convex/auth.config.ts`
- `convex/convex.config.ts`

## Completion Checklist
- [ ] Stack Auth package installed
- [ ] Environment variables set (get from https://app.stack-auth.com)
- [ ] Stack client/server apps created
- [ ] Auth handlers at `/handler/*` working
- [ ] Convex integration configured
- [ ] Route protection working
- [ ] User can sign in/out at `/handler/sign-in` and `/handler/sign-up`

## Resources
- [Stack Auth Documentation](https://stack-auth.com)
- [Stack Auth + Convex Guide](https://docs.stack-auth.com/integrations/convex)
