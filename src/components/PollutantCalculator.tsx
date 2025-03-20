import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getAQICategory } from '@/utils/airQualityUtils';
import { AlertCircle } from 'lucide-react';

const PollutantCalculator = () => {
  const [pollutants, setPollutants] = useState({
    pm25: 10,
    pm10: 20,
    o3: 30,
    no2: 15,
    so2: 5,
    co: 0.5,
  });
  const [predictedAQI, setPredictedAQI] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePollutantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPollutants(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateAQI = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        "PM2.5": pollutants.pm25,
        "PM10": pollutants.pm10,
        "NO2": pollutants.no2,
        "CO": pollutants.co,
        "SO2": pollutants.so2,
        "O3": pollutants.o3
      };

      console.log('Sending request with data:', requestBody);

      const response = await fetch('https://web-production-e1cc7.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      setPredictedAQI(data.AQI);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(`Failed to get prediction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const aqiCategory = predictedAQI ? getAQICategory(predictedAQI) : null;

  return (
    <div className="space-y-6">
      <Card className="glass w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Air Quality Calculator</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4">Pollutant Values</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="pm25" className="text-sm">PM2.5 (µg/m³)</Label>
              <Input
                id="pm25"
                name="pm25"
                type="number"
                value={pollutants.pm25}
                onChange={handlePollutantChange}
              />
            </div>
            
            <div>
              <Label htmlFor="pm10" className="text-sm">PM10 (µg/m³)</Label>
              <Input
                id="pm10"
                name="pm10"
                type="number"
                value={pollutants.pm10}
                onChange={handlePollutantChange}
              />
            </div>
            
            <div>
              <Label htmlFor="o3" className="text-sm">Ozone (O₃) (ppb)</Label>
              <Input
                id="o3"
                name="o3"
                type="number"
                value={pollutants.o3}
                onChange={handlePollutantChange}
              />
            </div>
            
            <div>
              <Label htmlFor="no2" className="text-sm">Nitrogen Dioxide (NO₂) (ppb)</Label>
              <Input
                id="no2"
                name="no2"
                type="number"
                value={pollutants.no2}
                onChange={handlePollutantChange}
              />
            </div>
            
            <div>
              <Label htmlFor="so2" className="text-sm">Sulfur Dioxide (SO₂) (ppb)</Label>
              <Input
                id="so2"
                name="so2"
                type="number"
                value={pollutants.so2}
                onChange={handlePollutantChange}
              />
            </div>
            
            <div>
              <Label htmlFor="co" className="text-sm">Carbon Monoxide (CO) (ppm)</Label>
              <Input
                id="co"
                name="co"
                type="number"
                value={pollutants.co}
                onChange={handlePollutantChange}
              />
            </div>
          </div>

          <Button 
            onClick={calculateAQI} 
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Calculate AQI'}
          </Button>
          
          {error && (
            <div className="mt-6 p-4 rounded-lg text-white bg-red-500">
              <p>{error}</p>
            </div>
          )}
          
          {predictedAQI !== null && !error && (
            <div className={`mt-6 p-6 rounded-lg text-black shadow-lg border-2 border-white/20`} 
                 style={{ backgroundColor: aqiCategory?.color || '#6B7280' }}>
              <h3 className="text-xl font-bold mb-3">Predicted AQI</h3>
              <p className="text-4xl font-bold mb-3">{predictedAQI.toFixed(1)}</p>
              <div className="bg-white/10 p-3 rounded-md">
                <p className="text-lg font-semibold">{aqiCategory?.name}</p>
                <p className="text-sm mt-1">{aqiCategory?.description}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">How to use this calculator</h4>
              <p className="text-sm text-muted-foreground">
                Enter pollutant values to calculate an estimated AQI based on our machine learning model.
                This prediction uses weighted values of each pollutant to estimate overall air quality.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PollutantCalculator;
