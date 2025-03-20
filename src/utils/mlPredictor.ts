
// This is a simplified ML prediction system
// In a real application, you would use a proper ML model like TensorFlow.js

// Function to predict future AQI based on current pollutant values
export const predictAQI = (
  pm25: number, 
  pm10: number, 
  o3: number,
  no2: number,
  so2: number,
  co: number,
  temperature: number,
  humidity: number,
  windSpeed: number
): number => {
  // Simplified weighted model (these weights would normally come from training)
  const weights = {
    pm25: 0.5,    // PM2.5 has a strong correlation with AQI
    pm10: 0.2,    // PM10 has a moderate correlation
    o3: 0.15,     // Ozone has a moderate correlation
    no2: 0.1,     // Nitrogen dioxide has a modest correlation
    so2: 0.05,    // Sulfur dioxide has a small correlation
    co: 0.05,     // Carbon monoxide has a small correlation
    
    // Environmental factors
    temperature: 0.1,  // Higher temperatures can worsen pollution
    humidity: -0.05,   // Higher humidity can sometimes reduce particular matter
    windSpeed: -0.15   // Higher wind speed typically improves air quality
  };
  
  // Normalize inputs (simple min-max normalization)
  const normalizedInputs = {
    pm25: Math.min(1, pm25 / 300),
    pm10: Math.min(1, pm10 / 500),
    o3: Math.min(1, o3 / 200),
    no2: Math.min(1, no2 / 200),
    so2: Math.min(1, so2 / 200),
    co: Math.min(1, co / 30),
    temperature: (Math.min(Math.max(temperature, 10), 45) - 10) / 35,  // 10-45°C range
    humidity: humidity / 100,  // 0-100% range
    windSpeed: Math.min(1, windSpeed / 30)  // 0-30 mph range
  };
  
  // Calculate weighted sum
  let weightedSum = 0;
  
  weightedSum += normalizedInputs.pm25 * weights.pm25;
  weightedSum += normalizedInputs.pm10 * weights.pm10;
  weightedSum += normalizedInputs.o3 * weights.o3;
  weightedSum += normalizedInputs.no2 * weights.no2;
  weightedSum += normalizedInputs.so2 * weights.so2;
  weightedSum += normalizedInputs.co * weights.co;
  
  // Environmental factors - some improve air quality (negative weights)
  weightedSum += normalizedInputs.temperature * weights.temperature;
  weightedSum += normalizedInputs.humidity * weights.humidity;
  weightedSum += normalizedInputs.windSpeed * weights.windSpeed;
  
  // Scale to AQI range (0-500)
  const predictedAQI = Math.round(weightedSum * 500);
  
  // Ensure AQI is within valid range
  return Math.max(1, Math.min(500, predictedAQI));
};

// Function to predict future pollutant levels based on current levels and trends
export const predictPollutants = (
  currentPollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  },
  daysAhead: number,
  temperature: number,
  humidity: number,
  windSpeed: number
) => {
  // Trend factors - how pollutants evolve over time
  const trendFactors = {
    pm25: 0.95 + (Math.random() * 0.1),   // Slight decay with randomness
    pm10: 0.93 + (Math.random() * 0.1),   // Slight decay with randomness
    o3: 1.02 + (Math.random() * 0.1),     // Slight increase with randomness (due to sunlight)
    no2: 0.97 + (Math.random() * 0.1),    // Slight decay with randomness
    so2: 0.96 + (Math.random() * 0.1),    // Slight decay with randomness
    co: 0.95 + (Math.random() * 0.1)      // Slight decay with randomness
  };
  
  // Environmental impact - how environmental factors affect pollutants
  const environmentalImpact = {
    temperature: 0.02 * (temperature - 25) / 10,  // Higher temp increases pollutants
    humidity: -0.01 * (humidity - 50) / 50,       // Higher humidity decreases some pollutants
    windSpeed: -0.03 * windSpeed / 10             // Wind reduces pollutants
  };
  
  // Calculate combined factor per day
  const dayFactor = 1 + 
    environmentalImpact.temperature + 
    environmentalImpact.humidity + 
    environmentalImpact.windSpeed;
  
  // Apply trends and environmental factors
  const predictedPollutants = {
    pm25: Math.max(1, Math.round(currentPollutants.pm25 * Math.pow(trendFactors.pm25 * dayFactor, daysAhead))),
    pm10: Math.max(1, Math.round(currentPollutants.pm10 * Math.pow(trendFactors.pm10 * dayFactor, daysAhead))),
    o3: Math.max(1, Math.round(currentPollutants.o3 * Math.pow(trendFactors.o3 * dayFactor, daysAhead))),
    no2: Math.max(1, Math.round(currentPollutants.no2 * Math.pow(trendFactors.no2 * dayFactor, daysAhead))),
    so2: Math.max(1, Math.round(currentPollutants.so2 * Math.pow(trendFactors.so2 * dayFactor, daysAhead))),
    co: Math.max(0.1, Math.round(currentPollutants.co * Math.pow(trendFactors.co * dayFactor, daysAhead) * 10) / 10)
  };
  
  return predictedPollutants;
};
