# EventBnB - Frontend Application

A modern, Airbnb-inspired web application for discovering and booking events. Built with React, React Router, Tailwind CSS, and Zustand for state management.

## 🚀 Features

### Authentication
- **Login/Signup Pages**: Clean, user-friendly authentication UI
- **Role-Based Access**: Separate dashboards for Users and Listers
- **Protected Routes**: Frontend route protection based on authentication status and roles
- **Persistent Sessions**: User sessions persist across page refreshes

### Event Discovery
- **Home Page**: Beautiful hero section with event listings
- **Event Cards**: Display event images, titles, locations, dates, and prices
- **Advanced Filtering**:
  - Search by keywords
  - Filter by location
  - Filter by category
  - Filter by date range
  - Filter by price range
- **Responsive Grid Layout**: Adapts to all screen sizes

### Event Details
- **Image Gallery**: Multiple images with thumbnail navigation
- **Comprehensive Information**: Date, time, location, capacity, price
- **Booking Functionality**: Date selection and booking confirmation

### User Dashboard
- **Profile Section**: View and manage profile information
- **My Bookings**: View all upcoming bookings
- **Cancel Bookings**: Easy cancellation with confirmation modal
- **Empty States**: Helpful messages when no bookings exist

### Lister Dashboard
- **Create Events**: Full event creation form with validation
- **Edit Events**: Update existing event details
- **Delete Events**: Remove events with confirmation
- **View Bookings**: See all bookings for each event
- **Event Management**: Comprehensive table/list view of all events

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation
- **React Date Range** - Date picker component

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, Modal, etc.)
│   ├── layout/         # Layout components (Header, Footer)
│   ├── events/         # Event-related components (EventCard, EventFilters)
│   └── ProtectedRoute.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── EventDetails.jsx
│   ├── UserDashboard.jsx
│   └── ListerDashboard.jsx
├── store/              # Zustand stores
│   ├── authStore.js
│   ├── eventsStore.js
│   └── bookingsStore.js
├── data/               # Mock data
│   └── mockData.js
├── utils/              # Utility functions
│   └── toast.js
├── App.jsx             # Main app component with routing
└── main.jsx           # Entry point
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event_bnb
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 Usage

### Demo Credentials

The application uses mock authentication. You can login with:

**Regular User:**
- Email: Any email (e.g., `user@example.com`)
- Password: Any password (minimum 6 characters)

**Lister:**
- Email: Any email containing "lister" (e.g., `lister@example.com`)
- Password: Any password (minimum 6 characters)

### User Flow

1. **Browse Events**: Visit the home page to see all available events
2. **Filter & Search**: Use filters to find events by location, category, date, or price
3. **View Details**: Click on any event card to see full details
4. **Book Event**: Select a date and confirm your booking
5. **Manage Bookings**: View and cancel bookings from your dashboard

### Lister Flow

1. **Sign Up as Lister**: Choose "Create and manage events" during signup
2. **Create Events**: Use the dashboard to create new events
3. **Manage Events**: Edit or delete existing events
4. **View Bookings**: See all bookings for each of your events

## 🎨 Design Features

- **Airbnb-Inspired UI**: Modern, clean, and user-friendly design
- **Fully Responsive**: Mobile-first approach, works on all devices
- **Loading States**: Skeleton loaders for better UX
- **Toast Notifications**: User feedback for actions
- **Accessible**: Semantic HTML and keyboard navigation support
- **Smooth Animations**: Transitions and hover effects

## 📝 Component Responsibilities

### UI Components
- **Button**: Reusable button with variants (primary, secondary, outline, danger)
- **Input**: Form input with label and error handling
- **Card**: Container component with hover effects
- **Modal**: Reusable modal dialog
- **LoadingSpinner**: Loading indicator
- **Skeleton**: Loading placeholder

### Layout Components
- **Header**: Navigation bar with auth status and role-based links
- **Footer**: Site footer with links and information

### Event Components
- **EventCard**: Displays event preview with image, title, location, date, price
- **EventFilters**: Comprehensive filtering interface

### Pages
- **Home**: Event discovery with filters and grid layout
- **Login/Signup**: Authentication pages with form validation
- **EventDetails**: Full event information and booking
- **UserDashboard**: User's bookings and profile
- **ListerDashboard**: Event management interface

## 🔒 State Management

### Auth Store
- Manages user authentication state
- Handles login, logout, and user updates
- Persists to localStorage

### Events Store
- Manages event data
- Handles filtering logic
- CRUD operations for events

### Bookings Store
- Manages booking data
- Handles booking creation and cancellation
- Provides queries for user and event bookings

## 🎯 Future Enhancements

- Image upload functionality
- Advanced search with autocomplete
- Event reviews and ratings
- Payment integration UI
- Email notifications UI
- Calendar view for bookings
- Export bookings to PDF
- Event sharing functionality

## 📄 License

This project is for demonstration purposes.

## 👨‍💻 Development Notes

- All data is stored in frontend state (Zustand stores)
- No backend API calls are implemented
- Images use Unsplash placeholder URLs
- Authentication is mocked for demonstration
- All bookings and events persist in browser state

---

Built with ❤️ using React and modern web technologies.
