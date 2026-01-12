import { useState, useMemo } from 'react';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import useEventsStore from '../store/eventsStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Skeleton from '../components/ui/Skeleton';

const Home = () => {
  const events = useEventsStore((state) => state.events);
  const filters = useEventsStore((state) => state.filters);
  const [loading] = useState(false);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    if (filters.location) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((event) => event.category === filters.category);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (event) =>
          event.price >= filters.priceRange[0] && event.price <= filters.priceRange[1]
      );
    }

    if (filters.dateRange?.startDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= filters.dateRange.startDate && eventDate <= filters.dateRange.endDate;
      });
    }

    return filtered;
  }, [events, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-rose-100">
            Book unique experiences and create unforgettable memories
          </p>
        </div>
      </div>

      {/* Filters and Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventFilters />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

