# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

## Testing the Application

### As a Regular User:

1. **Sign Up** (or Login with any email)
   - Go to `/signup`
   - Choose "Browse and book events"
   - Fill in the form and submit

2. **Browse Events**
   - Home page shows all events
   - Use filters to narrow down results
   - Click on any event card to see details

3. **Book an Event**
   - Click "Book Event" on event details page
   - Select a date
   - Confirm booking

4. **View Bookings**
   - Go to Dashboard (`/dashboard`)
   - See all your bookings
   - Cancel bookings if needed

### As a Lister:

1. **Sign Up as Lister**
   - Go to `/signup`
   - Choose "Create and manage events"
   - Fill in the form and submit

2. **Create Events**
   - Go to Lister Dashboard (`/lister/dashboard`)
   - Click "Create Event"
   - Fill in event details
   - Submit

3. **Manage Events**
   - Edit existing events
   - Delete events
   - View bookings for each event

## Key Features to Test

- ✅ Authentication flow (Login/Signup)
- ✅ Role-based routing and redirects
- ✅ Event filtering (search, location, category, date, price)
- ✅ Event booking with date selection
- ✅ User dashboard with bookings
- ✅ Lister dashboard with event management
- ✅ Protected routes
- ✅ Toast notifications
- ✅ Responsive design

## Project Structure Overview

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Header, Footer
│   └── events/          # Event-specific components
├── pages/               # All page components
├── store/               # Zustand state management
├── data/                # Mock data
└── utils/               # Utility functions
```

## Notes

- All data is stored in frontend state (no backend)
- Authentication is mocked (any email/password works)
- Images use Unsplash placeholders
- State persists in localStorage for auth
- Bookings and events are stored in memory (reset on refresh)

