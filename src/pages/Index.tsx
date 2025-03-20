import { useState } from 'react';
import Hero from '@/components/Hero';
import AirQualityDisplay from '@/components/AirQualityDisplay';
import AirQualityForecast from '@/components/AirQualityForecast';
import LeafletMap from '@/components/LeafletMap';
import PollutantCalculator from '@/components/PollutantCalculator';
import WeatherInfo from '@/components/WeatherInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAirQuality } from '@/hooks/useAirQuality';

const Index = () => {
  const [activeTab, setActiveTab] = useState('map');
  const { 
    data, 
    isLoading, 
    currentLocation, 
    cityData,
    updateLocation, 
    getUserLocation 
  } = useAirQuality('Delhi, India');

  return (
    <div className="min-h-screen flex flex-col">
      <Hero 
        location={currentLocation}
        aqi={data?.current?.aqi || null}
        onLocationSelect={updateLocation}
        onGetCurrentLocation={getUserLocation}
        isLoading={isLoading}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <WeatherInfo city={currentLocation} />
            
            <AirQualityDisplay 
              data={data}
              isLoading={isLoading}
            />

            <AirQualityForecast 
              forecast={data?.forecast}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="map" className="flex-1">Map</TabsTrigger>
                <TabsTrigger value="calculator" className="flex-1">Calculator</TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="mt-0">
                <LeafletMap 
                  location={currentLocation}
                  coordinates={data?.coordinates}
                  currentAqi={data?.current?.aqi || 0}
                  isLoading={isLoading}
                  cityData={cityData}
                />
              </TabsContent>
              
              <TabsContent value="calculator" className="mt-0">
                <PollutantCalculator />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
