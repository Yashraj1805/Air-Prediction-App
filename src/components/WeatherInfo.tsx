import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Thermometer, Droplets, Wind, MapPin } from 'lucide-react';
import { OPENWEATHER_API_KEY } from '@/config/api';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  name: string;
}

interface WeatherInfoProps {
  city: string;
}

const WeatherInfo = ({ city }: WeatherInfoProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (cityName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather API Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city, fetchWeather]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <p>Loading weather data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 text-red-600">
        <p>{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
          <Thermometer className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Temperature</p>
          <p className="text-xl font-bold">{Math.round(weather?.main.temp || 0)}°C</p>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
          <Droplets className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Humidity</p>
          <p className="text-xl font-bold">{weather?.main.humidity || 0}%</p>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
          <Wind className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Wind Speed</p>
          <p className="text-xl font-bold">{Math.round(weather?.wind.speed || 0)} m/s</p>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
            {weather?.name || 'Unknown Location'}
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize mt-1">
          {weather?.weather[0].description}
        </p>
      </div>
    </Card>
  );
};

export default WeatherInfo; 