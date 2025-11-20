#!/bin/bash

# Deployment Setup Script
# This script helps you set up deployment to Vercel with GitHub Actions

set -e

echo "🚀 Vercel Deployment Setup"
echo "=========================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    pnpm add -g vercel
fi

echo "✅ Vercel CLI is installed"
echo ""

# Login to Vercel
echo "📝 Logging into Vercel..."
vercel login

# Link project
echo ""
echo "🔗 Linking to Vercel project..."
vercel link

# Get credentials
echo ""
echo "📋 Getting your Vercel credentials..."
echo ""

ORG_ID=$(cat .vercel/project.json | grep orgId | cut -d'"' -f4)
PROJECT_ID=$(cat .vercel/project.json | grep projectId | cut -d'"' -f4)

echo "✅ Found your credentials:"
echo ""
echo "VERCEL_ORG_ID: $ORG_ID"
echo "VERCEL_PROJECT_ID: $PROJECT_ID"
echo ""
echo "⚠️  You also need a VERCEL_TOKEN from: https://vercel.com/account/tokens"
echo ""
echo "📝 Add these three secrets to your GitHub repository:"
echo "   Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "   1. VERCEL_TOKEN (generate at https://vercel.com/account/tokens)"
echo "   2. VERCEL_ORG_ID: $ORG_ID"
echo "   3. VERCEL_PROJECT_ID: $PROJECT_ID"
echo ""
echo "✅ Once you've added the secrets, push to GitHub to trigger deployment!"
echo ""
echo "📚 For more details, see DEPLOYMENT.md"
