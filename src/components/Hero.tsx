
import { useEffect, useState, useRef } from 'react';
import LocationSearch from './LocationSearch';
import { getAQIColor } from '@/utils/airQualityUtils';

interface HeroProps {
  location: string;
  aqi: number | null;
  onLocationSelect: (location: string) => void;
  onGetCurrentLocation: () => void;
  isLoading: boolean;
}

const Hero = ({ 
  location, 
  aqi, 
  onLocationSelect, 
  onGetCurrentLocation,
  isLoading
}: HeroProps) => {
  const [animateAqi, setAnimateAqi] = useState(false);
  const prevAqi = useRef<number | null>(null);
  
  useEffect(() => {
    if (aqi !== null && prevAqi.current !== null && aqi !== prevAqi.current) {
      setAnimateAqi(true);
      const timer = setTimeout(() => setAnimateAqi(false), 800);
      return () => clearTimeout(timer);
    }
    prevAqi.current = aqi;
  }, [aqi]);

  const getBgStyle = () => {
    if (aqi === null) return '';
    
    const color = getAQIColor(aqi);
    
    const gradientMap: Record<string, string> = {
      'air-good': 'from-green-500/20 to-green-400/5',
      'air-moderate': 'from-yellow-500/20 to-yellow-400/5',
      'air-sensitive': 'from-orange-500/20 to-orange-400/5',
      'air-unhealthy': 'from-red-500/20 to-red-400/5',
      'air-veryUnhealthy': 'from-purple-500/20 to-purple-400/5',
      'air-hazardous': 'from-red-900/20 to-red-800/5',
    };
    
    return gradientMap[color] || 'from-blue-500/20 to-blue-400/5';
  };

  return (
    <section className={`w-full min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-16 bg-gradient-to-b ${getBgStyle()}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] right-[30%] w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <span className="inline-block px-3 py-1 glass rounded-full text-sm font-medium mb-4 animate-fade-in">
            India's Air Quality Index
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-down">
            Monitor India's <span className="text-primary">Air Quality</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 animate-slide-down" style={{ animationDelay: '100ms' }}>
            Track real-time air quality data across Indian cities, get accurate forecasts, and receive personalized health recommendations.
          </p>
          
          <div className="mb-8 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <LocationSearch 
              onLocationSelect={onLocationSelect} 
              onGetCurrentLocation={onGetCurrentLocation} 
            />
          </div>
          
          {location && (
            <div className="glass p-6 rounded-xl max-w-lg mx-auto animate-scale-in flex flex-col items-center" style={{ animationDelay: '300ms' }}>
              <h2 className="text-lg font-medium mb-2">{location}</h2>
              
              {isLoading ? (
                <div className="w-20 h-20 rounded-full bg-muted animate-pulse flex items-center justify-center">
                  <span className="text-muted-foreground">...</span>
                </div>
              ) : aqi !== null ? (
                <div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
                    animateAqi ? 'scale-110' : 'scale-100'
                  } transition-transform duration-300 border-${getAQIColor(aqi)}`}
                >
                  <span className={`text-3xl font-bold text-${getAQIColor(aqi)}`}>{aqi}</span>
                </div>
              ) : null}
              
              <p className="text-sm text-muted-foreground mt-2">Updated just now</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
