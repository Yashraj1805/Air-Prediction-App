
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { getAQIColor, getAQICategory } from '@/utils/airQualityUtils';
import { AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AirQualityMapProps {
  location: string;
  coordinates?: { lat: number; lng: number } | null;
  currentAqi: number;
  isLoading: boolean;
  cityData?: Array<{
    name: string;
    aqi: number;
    lat: number;
    lng: number;
  }>;
}

const LeafletMap = ({ 
  location, 
  coordinates, 
  currentAqi, 
  isLoading, 
  cityData = [] 
}: AirQualityMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  // Helper function to get hex color based on AQI
  const getAQIColorHex = (aqi: number): string => {
    const colorName = getAQIColor(aqi);
    const colorMap: Record<string, string> = {
      'air-good': '#34d399',        // green-500
      'air-moderate': '#fbbf24',    // yellow-500
      'air-sensitive': '#f97316',   // orange-500
      'air-unhealthy': '#ef4444',   // red-500
      'air-veryUnhealthy': '#a855f7', // purple-500
      'air-hazardous': '#7f1d1d',   // red-900
    };
    
    return colorMap[colorName] || '#3b82f6'; // blue-500 as default
  };

  useEffect(() => {
    // Skip if loading or no container
    if (isLoading || !mapRef.current) return;

    // Dynamically import Leaflet
    const loadLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        
        // If map doesn't exist, create it
        if (!leafletMapRef.current) {
          // Set default coordinates for India if not provided
          const defaultCoords = coordinates || { lat: 20.5937, lng: 78.9629 };
          
          // Create map
          const map = L.map(mapRef.current).setView([defaultCoords.lat, defaultCoords.lng], 5);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          leafletMapRef.current = map;
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        
        // Add markers for each city
        const cities = [...cityData];
        
        // Add current location if not already in the city data
        if (coordinates && !cities.some(city => 
          city.name.toLowerCase() === location.toLowerCase() || 
          (Math.abs(city.lat - coordinates.lat) < 0.1 && Math.abs(city.lng - coordinates.lng) < 0.1)
        )) {
          cities.push({
            name: location,
            aqi: currentAqi,
            lat: coordinates.lat,
            lng: coordinates.lng
          });
        }
        
        // Add markers for all cities
        cities.forEach(city => {
          // Create custom icon with AQI value
          const colorHex = getAQIColorHex(city.aqi);
          const isCurrentLocation = city.name.toLowerCase() === location.toLowerCase();
          const iconSize = isCurrentLocation ? 40 : 30;
          
          const customIcon = L.divIcon({
            className: 'custom-aqi-marker',
            html: `
              <div style="
                background-color: ${colorHex}; 
                color: white; 
                border-radius: 50%; 
                border: 2px solid white;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                width: ${iconSize}px; 
                height: ${iconSize}px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-weight: bold;
                font-size: ${isCurrentLocation ? '14px' : '12px'};
              ">
                ${city.aqi}
              </div>
            `,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize/2, iconSize/2]
          });
          
          // Create marker
          const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(leafletMapRef.current);
          
          // Add popup
          const aqiCategory = getAQICategory(city.aqi);
          marker.bindPopup(`
            <div class="popup-content">
              <strong>${city.name}</strong><br>
              AQI: <span style="color: ${colorHex}; font-weight: bold;">${city.aqi}</span><br>
              Status: ${aqiCategory.name}
            </div>
          `);
          
          // Open popup for current location
          if (isCurrentLocation) {
            marker.openPopup();
            leafletMapRef.current.setView([city.lat, city.lng], 7);
          }
          
          markersRef.current.push(marker);
        });
        
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };
    
    loadLeaflet();
    
    // Cleanup
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [location, coordinates, currentAqi, isLoading, cityData]);

  if (isLoading) {
    return (
      <Card className="glass w-full h-96 flex items-center justify-center animate-pulse">
        <p className="text-muted-foreground">Loading map data...</p>
      </Card>
    );
  }

  if (!location) {
    return (
      <Card className="glass w-full p-6">
        <div className="flex flex-col items-center justify-center h-72">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            No location data available. Please select a location.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass w-full overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <h2 className="text-xl font-medium">Air Quality Map</h2>
        <p className="text-sm text-muted-foreground">View air quality across India</p>
      </div>
      
      <div className="h-96 w-full relative" ref={mapRef}>
        {/* Map will be rendered here by Leaflet */}
      </div>
      
      <div className="p-3 flex justify-between text-xs text-muted-foreground">
        <span>Data source: WAQI API</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                <span>Legend</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs p-2 space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Good (0-50)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Moderate (51-100)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span>Unhealthy for Sensitive Groups (101-150)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Unhealthy (151-200)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span>Very Unhealthy (201-300)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-900 mr-2"></div>
                  <span>Hazardous (301+)</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};

export default LeafletMap;
