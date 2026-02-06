#!/bin/bash

# Booking System Deployment Script
echo "🚀 Deploying Booking & Approval System..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in to Supabase
echo "📋 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

# Deploy Edge Function
echo "📦 Deploying Edge Function..."
supabase functions deploy booking-confirmed

# Set environment variables (uncomment and modify as needed)
echo "⚙️ Setting up environment variables..."
# supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Apply database schema
echo "🗄️ Applying database schema..."
if [ -f "database/bookings-schema.sql" ]; then
    echo "Please run this SQL manually in your Supabase dashboard:"
    echo "https://app.supabase.com/project/YOUR_PROJECT_ID/sql"
    echo ""
    echo "Copy and paste the contents of: database/bookings-schema.sql"
else
    echo "❌ Schema file not found at database/bookings-schema.sql"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run the SQL schema in your Supabase dashboard"
echo "2. Set your RESEND_API_KEY environment variable"
echo "3. Test the booking system in your app"
echo ""
echo "📚 For detailed instructions, see BOOKING_SYSTEM.md"
