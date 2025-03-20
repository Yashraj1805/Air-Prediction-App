
import { getAQICategory, getAQIColor } from '@/utils/airQualityUtils';

interface AirQualityCardProps {
  aqi: number;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AirQualityCard = ({ 
  aqi, 
  title, 
  subtitle, 
  size = 'md',
  className = '' 
}: AirQualityCardProps) => {
  const category = getAQICategory(aqi);
  const color = getAQIColor(aqi);
  
  // Dynamic classes based on size
  const cardClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const aqiClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };
  
  const labelClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`glass rounded-xl ${cardClasses[size]} ${className}`}>
      {title && <h3 className={`font-medium mb-1 ${labelClasses[size]}`}>{title}</h3>}
      <div className="flex items-end gap-2">
        <span className={`font-bold ${aqiClasses[size]} text-${color}`}>{aqi}</span>
        <span className={`text-${color} ${labelClasses[size]} mb-1`}>AQI</span>
      </div>
      {subtitle && <p className={`text-muted-foreground ${labelClasses[size]} mt-1`}>{subtitle}</p>}
      <div className={`mt-2 text-${color} font-medium ${labelClasses[size]}`}>
        {category.name}
      </div>
    </div>
  );
};

export default AirQualityCard;
