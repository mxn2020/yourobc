// src/features/boilerplate/payments/providers/autumn-convex/config/autumn-setup.ts
/**
 * Autumn Convex Setup
 * 
 * This file shows how to set up Autumn with Convex
 * The actual setup is in your convex/autumn.ts file
 */

/**
 * Setup Instructions:
 * 
 * 1. Install Autumn Convex component:
 *    npm install @useautumn/convex
 * 
 * 2. Add to convex.config.ts:
 *    ```typescript
 *    import { defineApp } from "convex/server";
 *    import autumn from "@useautumn/convex/convex.config";
 *    
 *    const app = defineApp();
 *    app.use(autumn);
 *    export default app;
 *    ```
 * 
 * 3. Create convex/autumn.ts:
 *    ```typescript
 *    import { components } from "./_generated/api";
 *    import { Autumn } from "@useautumn/convex";
 *    
 *    export const autumn = new Autumn(components.autumn, {
 *      secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
 *      identify: async (ctx: any) => {
 *        const user = await ctx.auth.getUserIdentity();
 *        if (!user) return null;
 *        
 *        return {
 *          customerId: user.subject,
 *          customerData: {
 *            name: user.name,
 *            email: user.email,
 *          },
 *        };
 *      },
 *    });
 *    
 *    export const { 
 *      track, 
 *      cancel, 
 *      query, 
 *      attach, 
 *      check, 
 *      checkout, 
 *      usage 
 *    } = autumn.api();
 *    ```
 * 
 * 4. Environment variables:
 *    AUTUMN_SECRET_KEY=am_sk_xxxxxxxxxxxxx
 *    VITE_CONVEX_URL=https://your-convex-url.convex.cloud
 */

export const AUTUMN_CONVEX_SETUP_DOCS = `
Follow these steps to set up Autumn with Convex:

1. Install: npm install @useautumn/convex
2. Configure convex.config.ts (see code comments)
3. Create convex/autumn.ts (see code comments)
4. Set AUTUMN_SECRET_KEY in .env
`;