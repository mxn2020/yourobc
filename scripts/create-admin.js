#!/usr/bin/env node

/**
 * Script to create the first admin user
 * This script creates both the Better Auth user and the Convex profile
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || "http://localhost:3210");

async function createAdminUser() {
  console.log("🚀 Creating first admin user...");
  
  try {
    // Check if any admin users already exist
    const existingProfiles = await convex.query(api.profiles.getAllProfiles, {
      role: 'admin',
      limit: 1
    });

    if (existingProfiles && existingProfiles.length > 0) {
      console.log("✅ Admin user already exists:");
      console.log(`   Email: ${existingProfiles[0].email}`);
      console.log(`   Name: ${existingProfiles[0].name || 'Not set'}`);
      console.log(`   Role: ${existingProfiles[0].role}`);
      return;
    }

    // Get admin credentials from environment or prompt
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminName = process.env.ADMIN_NAME || "Admin User";
    const adminAuthId = process.env.ADMIN_AUTH_ID || "admin_" + Date.now();

    console.log(`📧 Creating admin profile for: ${adminEmail}`);

    // Create admin profile in Convex
    const profileId = await convex.mutation(api.profiles.createProfile, {
      authUserId: adminAuthId,
      email: adminEmail,
      name: adminName,
      role: 'admin',
    });

    console.log("✅ Admin profile created successfully!");
    console.log(`   Profile ID: ${profileId}`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: admin`);
    console.log("");
    console.log("🔐 IMPORTANT: You still need to:");
    console.log(`1. Create a user account in Better Auth with email: ${adminEmail}`);
    console.log(`2. Set the user ID in Better Auth to: ${adminAuthId}`);
    console.log("3. Or update this profile with the actual Better Auth user ID");
    console.log("");
    console.log("💡 You can sign up normally and then use the admin interface");
    console.log("   to update your role to admin, or update the database directly.");

  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  }
}

// Run the script
createAdminUser().then(() => {
  console.log("\n🎉 Admin setup complete!");
  process.exit(0);
});