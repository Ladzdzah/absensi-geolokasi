import React, { useState, useEffect } from 'react';
import { MapPin, Clock } from 'lucide-react';

interface LocationStatusProps {
  currentLocation: GeolocationPosition | null;
  isWithinOfficeRadius: () => boolean;
}

const LocationStatus: React.FC<LocationStatusProps> = ({
  currentLocation,
  isWithinOfficeRadius,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const getLocationStatus = () => {
    if (!currentLocation) return 'Mendeteksi lokasi...';
    return isWithinOfficeRadius() ? 'Di dalam area kantor' : 'Di luar area kantor';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg">
      {/* Location Status */}
      <div className="flex items-center">
        <MapPin className={`w-4 h-4 mr-2 ${
          !currentLocation 
            ? 'text-gray-400 animate-pulse' 
            : isWithinOfficeRadius() 
              ? 'text-green-400' 
              : 'text-red-400'
        }`} />
        <span className="text-sm text-gray-300">{getLocationStatus()}</span>
      </div>

      {/* Real-time Clock Display */}
      <div className="flex items-center text-gray-300">
        <Clock className="w-4 h-4 mr-2 text-blue-400" />
        <span className="text-sm font-medium tabular-nums">
          {currentTime.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
};

export default LocationStatus;