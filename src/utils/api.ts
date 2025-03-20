
import { generateMockAirQualityData } from './airQualityUtils';

// Real API call to fetch air quality data using WAQI API
export const fetchAirQualityData = async (location: string) => {
  try {
    // Token from user: acf2ee969b66f5b8b87a0b4ffb41b3ed63c80865
    const token = 'acf2ee969b66f5b8b87a0b4ffb41b3ed63c80865';
    
    // Try to fetch data from WAQI API
    const response = await fetch(`https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${token}`);
    const data = await response.json();
    
    // Fetch weather data
    const weatherData = await fetchWeatherData(location);
    
    // Check if API returned valid data
    if (data.status === 'ok' && data.data) {
      // Transform API data to match our app's data structure
      return transformWAQIData(data.data, location, weatherData);
    } else {
      console.log('Falling back to mock data due to API error or no data:', data.status);
      // Fall back to mock data if API fails or returns no data
      return generateMockAirQualityData(location, weatherData);
    }
  } catch (error) {
    console.error('Error fetching WAQI data:', error);
    // Fall back to mock data if fetch fails
    const weatherData = await fetchWeatherData(location).catch(() => null);
    return generateMockAirQualityData(location, weatherData);
  }
};

// Fetch weather data from OpenWeatherMap API
export const fetchWeatherData = async (location: string) => {
  try {
    const apiKey = 'ff62248c6c8414013e7a53063325d8ea';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},in&units=metric&appid=${apiKey}`);
    const data = await response.json();
    
    if (data.cod === 200) {
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        coords: {
          lat: data.coord.lat,
          lng: data.coord.lon
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

// Transform WAQI API data to match our app's data structure
const transformWAQIData = (data: any, location: string, weatherData: any = null) => {
  const today = new Date();
  const aqi = data.aqi || 0;
  
  // Extract pollutant data or use defaults
  const pollutants = {
    pm25: data.iaqi?.pm25?.v || 0,
    pm10: data.iaqi?.pm10?.v || 0,
    o3: data.iaqi?.o3?.v || 0,
    no2: data.iaqi?.no2?.v || 0,
    so2: data.iaqi?.so2?.v || 0,
    co: data.iaqi?.co?.v || 0
  };
  
  // Use OpenWeatherMap data if available, otherwise extract from WAQI or use defaults
  const temperature = weatherData?.temperature || data.iaqi?.t?.v || Math.floor(Math.random() * 20) + 15;
  const humidity = weatherData?.humidity || data.iaqi?.h?.v || Math.floor(Math.random() * 40) + 40;
  const windSpeed = weatherData?.windSpeed || data.iaqi?.w?.v || Math.floor(Math.random() * 15) + 1;
  
  // Get coordinates - use OpenWeatherMap if available, then WAQI, then defaults
  const coordinates = weatherData?.coords || 
                     (data.city?.geo ? { lat: data.city.geo[0], lng: data.city.geo[1] } : null);
  
  // Use ML forecast prediction for future data
  const forecastData = generateForecastWithML(aqi, pollutants, temperature, humidity, windSpeed);
  
  // Use real historical data if available, otherwise generate mock
  const historyData = data.forecast?.daily?.pm25?.slice(0, 24).map((item: any, i: number) => {
    const date = new Date(today);
    date.setHours(date.getHours() - i);
    
    return {
      dateTime: date.toISOString(),
      aqi: item.avg || Math.floor(Math.random() * 300) + 1,
      pollutants: {
        pm25: item.avg || Math.floor(Math.random() * 300) + 1,
        pm10: Math.floor(Math.random() * 400) + 1,
        o3: Math.floor(Math.random() * 100) + 1,
        no2: Math.floor(Math.random() * 150) + 1,
        so2: Math.floor(Math.random() * 120) + 1,
        co: Math.floor(Math.random() * 200) / 10,
      }
    };
  }) || [];
  
  // If history data is empty, generate mock data
  if (!historyData.length) {
    for (let i = 0; i < 24; i++) {
      const date = new Date(today);
      date.setHours(date.getHours() - i);
      
      historyData.push({
        dateTime: date.toISOString(),
        aqi: Math.floor(Math.random() * 300) + 1,
        pollutants: {
          pm25: Math.floor(Math.random() * 300) + 1,
          pm10: Math.floor(Math.random() * 400) + 1,
          o3: Math.floor(Math.random() * 100) + 1,
          no2: Math.floor(Math.random() * 150) + 1,
          so2: Math.floor(Math.random() * 120) + 1,
          co: Math.floor(Math.random() * 200) / 10,
        }
      });
    }
  }
  
  return {
    location: data.city?.name || location,
    coordinates: coordinates,
    current: {
      dateTime: today.toISOString(),
      aqi: aqi,
      temperature: temperature,
      humidity: humidity,
      windSpeed: windSpeed,
      pollutants: pollutants
    },
    forecast: forecastData,
    history: historyData,
  };
};

// Fetch locations using the WAQI API
export const fetchLocations = async (query: string) => {
  try {
    if (!query) {
      return getDefaultIndianCities();
    }
    
    const token = 'acf2ee969b66f5b8b87a0b4ffb41b3ed63c80865';
    const response = await fetch(`https://api.waqi.info/search/?keyword=${encodeURIComponent(query)}&token=${token}`);
    const data = await response.json();
    
    if (data.status === 'ok' && data.data) {
      // Filter to Indian cities
      const indianCities = data.data
        .filter((city: any) => {
          // Filter by cities in India
          return city.station.country === 'IN' || 
                 city.station.name.includes('India') || 
                 city.station.name.includes('Indian');
        })
        .map((city: any) => ({
          id: city.uid.toString(),
          name: city.station.name.split(',')[0],
          country: 'India'
        }));
      
      return indianCities.length ? indianCities : getDefaultIndianCities();
    }
    
    return getDefaultIndianCities();
  } catch (error) {
    console.error('Error fetching locations:', error);
    return getDefaultIndianCities();
  }
};

// Default Indian cities for fallback
const getDefaultIndianCities = () => {
  return [
    { id: '1', name: 'Delhi', country: 'India' },
    { id: '2', name: 'Mumbai', country: 'India' },
    { id: '3', name: 'Bangalore', country: 'India' },
    { id: '4', name: 'Chennai', country: 'India' },
    { id: '5', name: 'Kolkata', country: 'India' },
    { id: '6', name: 'Hyderabad', country: 'India' },
    { id: '7', name: 'Pune', country: 'India' },
    { id: '8', name: 'Ahmedabad', country: 'India' },
    { id: '9', name: 'Jaipur', country: 'India' },
    { id: '10', name: 'Lucknow', country: 'India' },
    { id: '11', name: 'Kanpur', country: 'India' },
    { id: '12', name: 'Nagpur', country: 'India' },
    { id: '13', name: 'Indore', country: 'India' },
    { id: '14', name: 'Thane', country: 'India' },
    { id: '15', name: 'Bhopal', country: 'India' },
  ];
};

// Function to generate forecast data using ML-like approach
const generateForecastWithML = (
  currentAqi: number, 
  pollutants: any, 
  temperature: number,
  humidity: number,
  windSpeed: number
) => {
  const today = new Date();
  
  // ML forecasting simulation (in a real app, this would use a trained model)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Weight factors for ML simulation
    const dayFactor = Math.sin(i * 0.5) * 0.2 + 1;  // Cyclical pattern
    const tempFactor = temperature > 30 ? 1.2 : temperature < 15 ? 0.8 : 1.0;
    const humidityFactor = humidity > 80 ? 1.3 : humidity < 40 ? 0.7 : 1.0;
    const windFactor = windSpeed > 20 ? 0.6 : windSpeed < 5 ? 1.4 : 1.0;
    
    // Base forecasted AQI with seasonal variation
    let forecastedAqi = currentAqi * dayFactor * tempFactor * humidityFactor * windFactor;
    
    // Apply random fluctuation (15% max)
    forecastedAqi *= (0.85 + Math.random() * 0.3);
    
    // Ensure AQI is within reasonable bounds
    forecastedAqi = Math.max(1, Math.min(500, Math.round(forecastedAqi)));
    
    // Calculate pollutants based on AQI prediction
    const pm25Ratio = pollutants.pm25 / Math.max(1, currentAqi);
    const pm10Ratio = pollutants.pm10 / Math.max(1, currentAqi);
    const o3Ratio = pollutants.o3 / Math.max(1, currentAqi);
    const no2Ratio = pollutants.no2 / Math.max(1, currentAqi);
    const so2Ratio = pollutants.so2 / Math.max(1, currentAqi);
    const coRatio = pollutants.co / Math.max(1, currentAqi);
    
    // Forecast temperature
    const tempVariation = Math.sin(i * 0.7) * 3;
    const forecastedTempMin = Math.max(10, Math.min(40, Math.round(temperature - 5 + tempVariation)));
    const forecastedTempMax = Math.max(forecastedTempMin + 3, Math.min(45, Math.round(temperature + 5 + tempVariation)));
    
    // Forecast humidity
    const humidityVariation = Math.sin(i * 0.9) * 10;
    const forecastedHumidity = Math.max(30, Math.min(95, Math.round(humidity + humidityVariation)));
    
    // Forecast wind speed
    const windVariation = Math.sin(i * 1.1) * 5;
    const forecastedWind = Math.max(1, Math.round(windSpeed + windVariation));
    
    return {
      dateTime: date.toISOString(),
      aqi: Math.round(forecastedAqi),
      temperature: {
        min: forecastedTempMin,
        max: forecastedTempMax
      },
      humidity: forecastedHumidity,
      windSpeed: forecastedWind,
      pollutants: {
        pm25: Math.round(forecastedAqi * pm25Ratio),
        pm10: Math.round(forecastedAqi * pm10Ratio),
        o3: Math.round(forecastedAqi * o3Ratio),
        no2: Math.round(forecastedAqi * no2Ratio),
        so2: Math.round(forecastedAqi * so2Ratio),
        co: Math.round(forecastedAqi * coRatio * 10) / 10,
      }
    };
  });
};
