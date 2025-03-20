
import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, MapPinOff } from 'lucide-react';
import { fetchLocations } from '@/utils/api';

interface Location {
  id: string;
  name: string;
  country: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  onGetCurrentLocation: () => void;
}

const LocationSearch = ({ onLocationSelect, onGetCurrentLocation }: LocationSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchLocations = async () => {
      if (query.length < 2) {
        setLocations([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await fetchLocations(query);
        setLocations(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location.name);
    setQuery(location.name);
    setIsOpen(false);
  };

  const handleClearInput = () => {
    setQuery('');
    setLocations([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search for a city in India..."
          className="w-full pl-10 pr-10 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-glass focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {query && (
          <button
            onClick={handleClearInput}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onGetCurrentLocation}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Use current location"
        >
          <MapPin className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute mt-2 w-full max-h-64 overflow-y-auto bg-white/70 backdrop-blur-md rounded-lg shadow-glass border border-white/40 z-10 animate-slide-up"
        >
          {isLoading ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : locations.length > 0 ? (
            <ul className="py-2">
              {locations.map((location) => (
                <li key={location.id}>
                  <button
                    onClick={() => handleLocationClick(location)}
                    className="w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{location.name}</div>
                      <div className="text-xs text-muted-foreground">{location.country}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-3 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <MapPinOff className="h-5 w-5" />
              <p>No locations found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
