
import { useState } from 'react';
import { formatDate } from '@/utils/airQualityUtils';
import AirQualityCard from './AirQualityCard';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface ForecastDay {
  dateTime: string;
  aqi: number;
  temperature: {
    min: number;
    max: number;
  };
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
}

interface AirQualityForecastProps {
  forecast: ForecastDay[];
  isLoading: boolean;
}

const AirQualityForecast = ({ forecast, isLoading }: AirQualityForecastProps) => {
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(forecast ? forecast[0] : null);

  if (isLoading) {
    return (
      <Card className="glass w-full h-64 flex items-center justify-center animate-pulse">
        <p className="text-muted-foreground">Loading forecast data...</p>
      </Card>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <Card className="glass w-full p-6">
        <div className="flex flex-col items-center justify-center h-48">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            No forecast data available. Please try a different location.
          </p>
        </div>
      </Card>
    );
  }

  // Format data for chart
  const chartData = forecast.map(day => ({
    date: formatDate(day.dateTime),
    aqi: day.aqi,
    pm25: day.pollutants.pm25,
    o3: day.pollutants.o3,
  }));

  return (
    <div className="space-y-6">
      <Card className="glass w-full p-4">
        <h2 className="text-xl font-medium mb-4">AQI Forecast</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(0,0,0,0.5)" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
              />
              <YAxis 
                stroke="rgba(0,0,0,0.5)" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="aqi" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', stroke: 'white', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-medium mb-4">7-Day Forecast</h2>
        <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide">
          {forecast.map((day, index) => (
            <div 
              key={index}
              className={`min-w-[120px] cursor-pointer transition-all ${
                selectedDay && selectedDay.dateTime === day.dateTime
                  ? 'transform scale-105'
                  : 'opacity-80'
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <AirQualityCard
                aqi={day.aqi}
                title={formatDate(day.dateTime)}
                subtitle={`${day.temperature.min}° - ${day.temperature.max}°`}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      {selectedDay && (
        <Card className="glass w-full p-4">
          <h2 className="text-lg font-medium mb-3">
            {formatDate(selectedDay.dateTime)} Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-3">
              <h3 className="text-xs font-medium">Temperature</h3>
              <p className="text-lg font-bold mt-1">
                {selectedDay.temperature.min}° - {selectedDay.temperature.max}°C
              </p>
            </div>
            
            <div className="glass rounded-xl p-3">
              <h3 className="text-xs font-medium">Humidity</h3>
              <p className="text-lg font-bold mt-1">{selectedDay.humidity}%</p>
            </div>
            
            <div className="glass rounded-xl p-3">
              <h3 className="text-xs font-medium">Wind Speed</h3>
              <p className="text-lg font-bold mt-1">{selectedDay.windSpeed} mph</p>
            </div>
            
            <div className="glass rounded-xl p-3">
              <h3 className="text-xs font-medium">PM2.5</h3>
              <p className="text-lg font-bold mt-1">{selectedDay.pollutants.pm25}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AirQualityForecast;
