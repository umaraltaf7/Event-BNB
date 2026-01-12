import { Link } from 'react-router-dom';
import Card from '../ui/Card';

const EventCard = ({
  event,
  className = 'h-full',
  imageHeightClass = 'h-48',
  showPrice = true,
  showLocation = true,
  showDate = true,
  showCategory = true,
  to,
  clickable = true,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const imageSrc = event?.images?.[0];
  const Wrapper = clickable ? Link : 'div';
  const wrapperProps = clickable ? { to: to || `/events/${event.id}` } : {};

  return (
    <Wrapper {...wrapperProps}>
      <Card className={className}>
        <div className={`relative ${imageHeightClass} overflow-hidden`}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={event.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
          {showPrice && (
            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-rose-600">
              ${event.price}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {event.title}
          </h3>
          {showLocation && (
            <p className="text-gray-600 text-sm mb-2">{event.location}</p>
          )}
          {showDate && (
            <p className="text-gray-500 text-sm">{formatDate(event.date)}</p>
          )}
          {showCategory && (
            <div className="mt-2">
              <span className="inline-block bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full">
                {event.category}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Wrapper>
  );
};

export default EventCard;

