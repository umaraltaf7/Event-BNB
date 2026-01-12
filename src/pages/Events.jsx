import { useMemo, useState } from 'react';
import EventFilters from '../components/events/EventFilters';
import EventCard from '../components/events/EventCard';
import useEventsStore from '../store/eventsStore';
import Skeleton from '../components/ui/Skeleton';

const pakistanCities = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi'];

const Events = () => {
  const getFilteredEvents = useEventsStore((s) => s.getFilteredEvents);
  const filters = useEventsStore((s) => s.filters);
  const eventsState = useEventsStore((s) => s.events);
  const [loading] = useState(false);

  const events = useMemo(() => getFilteredEvents(), [getFilteredEvents, filters, eventsState]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
          <p className="text-gray-600 mt-2">Find experiences across Pakistan</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventFilters locations={pakistanCities} />

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
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
