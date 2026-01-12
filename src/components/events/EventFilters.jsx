import { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import useEventsStore from '../../store/eventsStore';
import { eventCategories as defaultCategories, locations as defaultLocations } from '../../data/mockData';
import Input from '../ui/Input';
import Button from '../ui/Button';

const EventFilters = ({
  locations = defaultLocations,
  categories = defaultCategories,
  showDateRange = true,
  showPrice = true,
}) => {
  const { filters, setFilters, resetFilters } = useEventsStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: filters.dateRange?.startDate || new Date(),
    endDate: filters.dateRange?.endDate || new Date(),
    key: 'selection',
  });

  const handleDateSelect = (ranges) => {
    setDateRange(ranges.selection);
    setFilters({
      dateRange: {
        startDate: ranges.selection.startDate,
        endDate: ranges.selection.endDate,
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Input
            label="Search"
            type="text"
            placeholder="Search events..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={filters.location}
            onChange={(e) => setFilters({ location: e.target.value })}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showDateRange && (
        <div className="relative mt-4 w-full sm:max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {filters.dateRange
              ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
              : 'Select dates'}
          </button>
          {showDatePicker && (
            <>
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowDatePicker(false)}
              ></div>
              <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl w-auto min-w-[36rem] lg:min-w-[44rem] overflow-hidden">
                <DateRange
                  ranges={[dateRange]}
                  onChange={handleDateSelect}
                  months={2}
                  direction="horizontal"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {showPrice && (
          <div className="w-full lg:max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <div className="px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                  ${filters.priceRange[0]}
                </span>
                <span className="text-gray-400 text-xs uppercase tracking-wider">to</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                  ${filters.priceRange[1]}
                </span>
              </div>
              <div className="relative h-8">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gray-200"></div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                  style={{ left: `${(filters.priceRange[0] / 1000) * 100}%`, right: `${100 - (filters.priceRange[1] / 1000) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const min = Math.min(Number(e.target.value), filters.priceRange[1]);
                    setFilters({ priceRange: [min, filters.priceRange[1]] });
                  }}
                  className="absolute top-0 left-0 w-full h-8 bg-transparent appearance-none z-10 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-rose-500"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const max = Math.max(Number(e.target.value), filters.priceRange[0]);
                    setFilters({ priceRange: [filters.priceRange[0], max] });
                  }}
                  className="absolute top-0 left-0 w-full h-8 bg-transparent appearance-none z-10 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-rose-500"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setFilters({ priceRange: [0, 1000] })} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:border-rose-500 hover:text-rose-600">Any</button>
                <button type="button" onClick={() => setFilters({ priceRange: [0, 100] })} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:border-rose-500 hover:text-rose-600">$0–$100</button>
                <button type="button" onClick={() => setFilters({ priceRange: [100, 300] })} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:border-rose-500 hover:text-rose-600">$100–$300</button>
                <button type="button" onClick={() => setFilters({ priceRange: [300, 600] })} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:border-rose-500 hover:text-rose-600">$300–$600</button>
                <button type="button" onClick={() => setFilters({ priceRange: [600, 1000] })} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:border-rose-500 hover:text-rose-600">$600–$1000</button>
              </div>
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default EventFilters;

