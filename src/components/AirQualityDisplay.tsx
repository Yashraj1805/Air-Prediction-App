
import { useState } from 'react';
import { getAQICategory, getHealthRecommendations } from '@/utils/airQualityUtils';
import AirQualityCard from './AirQualityCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, Droplets, Thermometer, AlertCircle } from 'lucide-react';

interface AirQualityData {
  location: string;
  current: {
    dateTime: string;
    aqi: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    pollutants: {
      pm25: number;
      pm10: number;
      o3: number;
      no2: number;
      so2: number;
      co: number;
    };
  };
}

interface AirQualityDisplayProps {
  data: AirQualityData;
  isLoading: boolean;
}

const AirQualityDisplay = ({ data, isLoading }: AirQualityDisplayProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <Card className="glass w-full h-64 flex items-center justify-center animate-pulse">
        <p className="text-muted-foreground">Loading air quality data...</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="glass w-full p-6">
        <div className="flex flex-col items-center justify-center h-48">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            No air quality data available. Please try a different location.
          </p>
        </div>
      </Card>
    );
  }

  const { current } = data;
  const aqiCategory = getAQICategory(current.aqi);
  const recommendations = getHealthRecommendations(current.aqi);

  return (
    <Card className="glass w-full overflow-hidden">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="p-4 pb-0">
          <TabsList className="w-full glass">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="pollutants" className="flex-1">Pollutants</TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">Health Tips</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-4 pt-0 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2">
              <AirQualityCard 
                aqi={current.aqi} 
                title="Current Air Quality" 
                subtitle={data.location}
                size="lg"
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pollutants" className="p-4 pt-0 mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-medium">PM2.5</h3>
              <p className="text-xl font-bold mt-1">{current.pollutants.pm25} µg/m³</p>
              <p className="text-xs text-muted-foreground mt-1">Fine Particulate Matter</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-medium">PM10</h3>
              <p className="text-xl font-bold mt-1">{current.pollutants.pm10} µg/m³</p>
              <p className="text-xs text-muted-foreground mt-1">Coarse Particulate Matter</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-medium">O₃</h3>
              <p className="text-xl font-bold mt-1">{current.pollutants.o3} ppb</p>
              <p className="text-xs text-muted-foreground mt-1">Ozone</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-medium">NO₂</h3>
              <p className="text-xl font-bold mt-1">{current.pollutants.no2} ppb</p>
              <p className="text-xs text-muted-foreground mt-1">Nitrogen Dioxide</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-medium">SO₂</h3>
              <p className="text-xl font-bold mt-1">{current.pollutants.so2} ppb</p>
              <p className="text-xs text-muted-foreground mt-1">Sulfur Dioxide</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-medium">CO</h3>
              <p className="text-xl font-bold mt-1">{current.pollutants.co} ppm</p>
              <p className="text-xs text-muted-foreground mt-1">Carbon Monoxide</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="p-4 pt-0 mt-0">
          <div className="mt-4 space-y-4">
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold">General Advice</h3>
              <p className="text-base mt-1">{recommendations.general}</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold">Sensitive Groups</h3>
              <p className="text-base mt-1">{recommendations.sensitive}</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold">Outdoor Activities</h3>
              <p className="text-base mt-1">{recommendations.outdoor}</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold">Indoor Recommendations</h3>
              <p className="text-base mt-1">{recommendations.indoor}</p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold">Mask Usage</h3>
              <p className="text-base mt-1">{recommendations.mask}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AirQualityDisplay;
