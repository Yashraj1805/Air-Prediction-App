
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAirQualityData, fetchLocations } from '../utils/api';
import { predictAQI, predictPollutants } from '../utils/mlPredictor';

export const useAirQuality = (location: string) => {
  const [currentLocation, setCurrentLocation] = useState(location);
  const [cityData, setCityData] = useState<Array<{
    name: string;
    aqi: number;
    lat: number;
    lng: number;
  }>>([]);

  // Use React Query to fetch and cache air quality data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['airQuality', currentLocation],
    queryFn: () => fetchAirQualityData(currentLocation),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch AQI data for major Indian cities for the map
  useEffect(() => {
    const loadCityData = async () => {
      try {
        // Get default cities
        const cities = await fetchLocations('');
        
        // Fetch AQI data for each city
        const citiesWithData = await Promise.all(
          cities.slice(0, 10).map(async (city) => {
            try {
              const cityData = await fetchAirQualityData(city.name);
              return {
                name: city.name,
                aqi: cityData.current.aqi,
                lat: cityData.coordinates?.lat || 0,
                lng: cityData.coordinates?.lng || 0
              };
            } catch (error) {
              console.error(`Error fetching data for ${city.name}:`, error);
              return null;
            }
          })
        );
        
        // Filter out nulls
        setCityData(citiesWithData.filter(Boolean) as any[]);
      } catch (error) {
        console.error('Error loading city data:', error);
      }
    };
    
    loadCityData();
  }, []);

  // Update location and refetch data
  const updateLocation = (newLocation: string) => {
    setCurrentLocation(newLocation);
  };

  // Get user's current location (browser geolocation)
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get nearest city based on coordinates using the WAQI API
            const { latitude, longitude } = position.coords;
            const token = 'acf2ee969b66f5b8b87a0b4ffb41b3ed63c80865';
            const response = await fetch(
              `https://api.waqi.info/feed/here/?token=${token}`
            );
            const result = await response.json();
            
            if (result.status === 'ok' && result.data.city) {
              setCurrentLocation(result.data.city.name);
            } else {
              // Fallback to generic name with coordinates
              setCurrentLocation(`Location at ${latitude.toFixed(2)}, ${longitude.toFixed(2)}, India`);
            }
          } catch (error) {
            console.error("Error getting location name:", error);
            setCurrentLocation("Current Location, India");
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Generate ML predictions for forecast if data is available
  useEffect(() => {
    if (data && data.current) {
      // Log prediction for debugging
      const pollutants = data.current.pollutants;
      const mlPrediction = predictAQI(
        pollutants.pm25,
        pollutants.pm10,
        pollutants.o3,
        pollutants.no2,
        pollutants.so2,
        pollutants.co,
        data.current.temperature,
        data.current.humidity,
        data.current.windSpeed
      );
      
      console.log('ML AQI Prediction:', mlPrediction, 'Actual AQI:', data.current.aqi);
    }
  }, [data]);

  return {
    data,
    isLoading,
    isError,
    error,
    currentLocation,
    cityData,
    updateLocation,
    getUserLocation,
    refetchData: refetch
  };
};
