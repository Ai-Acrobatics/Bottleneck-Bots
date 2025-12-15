#!/bin/bash

# Sentry Installation Script
# Run this script to install Sentry dependencies

echo "🚀 Installing Sentry packages for error tracking..."

# Install required dependencies
pnpm add @sentry/react @sentry/node @sentry/profiling-node

echo ""
echo "✅ Sentry packages installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Get your Sentry DSN from https://sentry.io"
echo "2. Add to .env file:"
echo "   SENTRY_DSN=your_sentry_dsn_here"
echo "   VITE_SENTRY_DSN=your_sentry_dsn_here"
echo ""
echo "3. For Vercel deployment, add both environment variables:"
echo "   - SENTRY_DSN"
echo "   - VITE_SENTRY_DSN"
echo ""
echo "4. Read SENTRY_INTEGRATION.md for full documentation"
echo ""
