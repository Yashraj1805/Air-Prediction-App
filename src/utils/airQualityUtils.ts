
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: any[]) {
  return twMerge(...inputs);
}

// Function to format date strings
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Helper function to get AQI category based on AQI value
export const getAQICategory = (aqi: number) => {
  if (aqi <= 50) {
    return {
      name: 'Good',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      color: 'air-good'
    };
  } else if (aqi <= 100) {
    return {
      name: 'Moderate',
      description: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
      color: 'air-moderate'
    };
  } else if (aqi <= 150) {
    return {
      name: 'Unhealthy for Sensitive Groups',
      description: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
      color: 'air-sensitive'
    };
  } else if (aqi <= 200) {
    return {
      name: 'Unhealthy',
      description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.',
      color: 'air-unhealthy'
    };
  } else if (aqi <= 300) {
    return {
      name: 'Very Unhealthy',
      description: 'Health alert: Everyone may experience more serious health effects.',
      color: 'air-veryUnhealthy'
    };
  } else {
    return {
      name: 'Hazardous',
      description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
      color: 'air-hazardous'
    };
  }
};

// Helper function to get hex color based on AQI category
export const getAQIColor = (aqi: number): string => {
  const category = getAQICategory(aqi);
  return category.color;
};

// Function to generate health recommendations based on AQI
export const getHealthRecommendations = (aqi: number) => {
  if (aqi <= 50) {
    return {
      general: 'Enjoy your usual outdoor activities.',
      sensitive: 'Air quality is good for everyone.',
      outdoor: 'Ideal conditions for all outdoor activities.',
      indoor: 'No specific recommendations.',
      mask: 'Mask is not required.'
    };
  } else if (aqi <= 100) {
    return {
      general: 'Air quality is acceptable; however, unusually sensitive people should consider reducing prolonged or heavy exertion.',
      sensitive: 'People with respiratory issues, children, and the elderly should limit prolonged outdoor exertion.',
      outdoor: 'Most people can enjoy outdoor activities, but sensitive groups should take precautions.',
      indoor: 'No specific recommendations.',
      mask: 'Mask is generally not required.'
    };
  } else if (aqi <= 150) {
    return {
      general: 'General public is not likely to be affected, but sensitive groups may experience health effects.',
      sensitive: 'People with heart or lung disease, older adults, and children should reduce prolonged or heavy exertion.',
      outdoor: 'Limit prolonged outdoor exertion.',
      indoor: 'Consider using an air purifier.',
      mask: 'Sensitive groups should consider wearing a mask.'
    };
  } else if (aqi <= 200) {
    return {
      general: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
      sensitive: 'People with heart or lung disease, older adults, and children should avoid prolonged or heavy exertion; everyone else should reduce exertion.',
      outdoor: 'Reduce outdoor activities.',
      indoor: 'Use an air purifier and keep windows closed.',
      mask: 'Everyone should consider wearing a mask, especially outdoors.'
    };
  } else if (aqi <= 300) {
    return {
      general: 'Health alert: everyone may experience more serious health effects.',
      sensitive: 'People with heart or lung disease, older adults, and children should avoid all physical activity outdoors; everyone else should avoid prolonged or heavy exertion.',
      outdoor: 'Avoid all outdoor activities.',
      indoor: 'Use an air purifier and stay indoors.',
      mask: 'Everyone should wear a mask, and consider avoiding going out.'
    };
  } else {
    return {
      general: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
      sensitive: 'Everyone should remain indoors.',
      outdoor: 'Avoid all outdoor activities.',
      indoor: 'Stay indoors and use an air purifier.',
      mask: 'Everyone should wear a high-quality mask and avoid going out.'
    };
  }
};

// Function to generate mock air quality data for testing
export function generateMockAirQualityData(location: string, weatherData: any = null) {
  const today = new Date();
  
  // Generate a random but reasonable AQI value
  const aqi = Math.floor(Math.random() * 300) + 1;
  
  // Use provided weather data or generate random values
  const temperature = weatherData?.temperature || Math.floor(Math.random() * 20) + 15;
  const humidity = weatherData?.humidity || Math.floor(Math.random() * 40) + 40;
  const windSpeed = weatherData?.windSpeed || Math.floor(Math.random() * 15) + 1;
  
  // Generate mock pollutant values based on AQI (in real life these would be measured)
  const pm25 = Math.max(0, Math.floor(aqi * 0.8 + (Math.random() * 20 - 10)));
  const pm10 = Math.max(0, Math.floor(aqi * 1.2 + (Math.random() * 30 - 15)));
  const o3 = Math.max(0, Math.floor(aqi * 0.3 + (Math.random() * 10 - 5)));
  const no2 = Math.max(0, Math.floor(aqi * 0.4 + (Math.random() * 15 - 7)));
  const so2 = Math.max(0, Math.floor(aqi * 0.2 + (Math.random() * 8 - 4)));
  const co = Math.max(0, parseFloat((aqi * 0.05 + (Math.random() * 2 - 1)).toFixed(1)));
  
  // Generate forecast data using our ML predictor
  const forecastData = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Apply some random variations for the forecast
    const forecastAqi = Math.max(1, Math.min(500, Math.floor(aqi * (0.7 + Math.random() * 0.6))));
    const tempVariation = Math.sin(i * 0.7) * 3;
    const tempMin = Math.round(temperature - 5 + tempVariation);
    const tempMax = Math.round(temperature + 5 + tempVariation);
    const humidityVariation = Math.sin(i * 0.9) * 10;
    const forecastHumidity = Math.round(humidity + humidityVariation);
    const windVariation = Math.sin(i * 1.1) * 5;
    const forecastWind = Math.max(1, Math.round(windSpeed + windVariation));
    
    forecastData.push({
      dateTime: date.toISOString(),
      aqi: forecastAqi,
      temperature: {
        min: tempMin,
        max: tempMax
      },
      humidity: forecastHumidity,
      windSpeed: forecastWind,
      pollutants: {
        pm25: Math.max(0, Math.floor(forecastAqi * 0.8 + (Math.random() * 20 - 10))),
        pm10: Math.max(0, Math.floor(forecastAqi * 1.2 + (Math.random() * 30 - 15))),
        o3: Math.max(0, Math.floor(forecastAqi * 0.3 + (Math.random() * 10 - 5))),
        no2: Math.max(0, Math.floor(forecastAqi * 0.4 + (Math.random() * 15 - 7))),
        so2: Math.max(0, Math.floor(forecastAqi * 0.2 + (Math.random() * 8 - 4))),
        co: Math.max(0, parseFloat((forecastAqi * 0.05 + (Math.random() * 2 - 1)).toFixed(1)))
      }
    });
  }
  
  // Generate historical data for the past 24 hours
  const historyData = [];
  for (let i = 0; i < 24; i++) {
    const date = new Date(today);
    date.setHours(date.getHours() - i);
    
    // Apply some variation to historical data
    const historyAqi = Math.max(1, Math.min(500, Math.floor(aqi * (0.7 + Math.random() * 0.6))));
    
    historyData.push({
      dateTime: date.toISOString(),
      aqi: historyAqi,
      pollutants: {
        pm25: Math.max(0, Math.floor(historyAqi * 0.8 + (Math.random() * 20 - 10))),
        pm10: Math.max(0, Math.floor(historyAqi * 1.2 + (Math.random() * 30 - 15))),
        o3: Math.max(0, Math.floor(historyAqi * 0.3 + (Math.random() * 10 - 5))),
        no2: Math.max(0, Math.floor(historyAqi * 0.4 + (Math.random() * 15 - 7))),
        so2: Math.max(0, Math.floor(historyAqi * 0.2 + (Math.random() * 8 - 4))),
        co: Math.max(0, parseFloat((historyAqi * 0.05 + (Math.random() * 2 - 1)).toFixed(1)))
      }
    });
  }
  
  // Get coordinates for the location (mock for most cities)
  const coordinates = weatherData?.coords || getCityCoordinates(location);
  
  return {
    location: location,
    coordinates: coordinates,
    current: {
      dateTime: today.toISOString(),
      aqi: aqi,
      temperature: temperature,
      humidity: humidity,
      windSpeed: windSpeed,
      pollutants: {
        pm25: pm25,
        pm10: pm10,
        o3: o3,
        no2: no2,
        so2: so2,
        co: co
      }
    },
    forecast: forecastData,
    history: historyData
  };
}

// Helper function to get coordinates for major Indian cities
function getCityCoordinates(location: string) {
  const cityCoordinates: {[key: string]: {lat: number, lng: number}} = {
    'Delhi': {lat: 28.7041, lng: 77.1025},
    'Mumbai': {lat: 19.0760, lng: 72.8777},
    'Bangalore': {lat: 12.9716, lng: 77.5946},
    'Bengaluru': {lat: 12.9716, lng: 77.5946},
    'Chennai': {lat: 13.0827, lng: 80.2707},
    'Kolkata': {lat: 22.5726, lng: 88.3639},
    'Hyderabad': {lat: 17.3850, lng: 78.4867},
    'Pune': {lat: 18.5204, lng: 73.8567},
    'Ahmedabad': {lat: 23.0225, lng: 72.5714},
    'Jaipur': {lat: 26.9124, lng: 75.7873},
    'Lucknow': {lat: 26.8467, lng: 80.9462},
    'Kanpur': {lat: 26.4499, lng: 80.3319},
    'Nagpur': {lat: 21.1458, lng: 79.0882},
    'Indore': {lat: 22.7196, lng: 75.8577},
    'Thane': {lat: 19.2183, lng: 72.9781},
    'Bhopal': {lat: 23.2599, lng: 77.4126},
  };
  
  // Check if we have coordinates for this city
  for (const city in cityCoordinates) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return cityCoordinates[city];
    }
  }
  
  // Default to center of India if city not found
  return {lat: 20.5937, lng: 78.9629};
}
