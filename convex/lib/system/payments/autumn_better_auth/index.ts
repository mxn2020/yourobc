// convex/lib/boilerplate/payments/autumn_better_auth/index.ts

/**

Autumn Better Auth (No Convex Backend Needed)
Frontend:
└── autumn-betterauth/
    ├── hooks/
    │   └── useAutumnCustomer.ts  ✅ Uses autumn-js/react
    └── components/

Backend (Better Auth Server):
└── auth-config.ts
    └── autumn() plugin  ✅ Handles everything

Backend (Convex):
└── (NOT USED FOR PAYMENTS)
Flow:
User → Better Auth → Autumn API → Stripe
                    ↓
              Automatic sync
Key Point: With Autumn Better Auth, you DON'T need Convex payment mutations/queries at all! Autumn handles everything through Better Auth.


 */

