import React, { useState, useEffect } from 'react';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';

interface LocationStatusProps {
  currentLocation: GeolocationPosition | null;
  isWithinOfficeRadius: () => boolean;
  locationError?: GeolocationPositionError | null;
  officeDistance?: number | null;
}

const LocationStatus: React.FC<LocationStatusProps> = ({
  currentLocation,
  isWithinOfficeRadius,
  locationError = null,
  officeDistance = null,
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
    if (locationError) {
      return `Error: ${locationError.message}`;
    }
    
    if (!currentLocation) return 'Mendeteksi lokasi...';
    
    if (isWithinOfficeRadius()) {
      return 'Di dalam area kantor';
    } else {
      if (officeDistance) {
        const distanceKm = (officeDistance / 1000).toFixed(2);
        return `Di luar area (${distanceKm} km)`;
      }
      return 'Di luar area kantor';
    }
  };

  const getStatusColor = () => {
    if (locationError) return 'text-yellow-400';
    if (!currentLocation) return 'text-gray-400 animate-pulse';
    return isWithinOfficeRadius() ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = () => {
    if (locationError) {
      return <AlertTriangle className={`w-4 h-4 mr-1.5 ${getStatusColor()}`} />;
    }
    return <MapPin className={`w-4 h-4 mr-1.5 ${getStatusColor()}`} />;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 bg-gray-800/60 rounded-lg">
      {/* Location Status */}
      <div className="flex items-center">
        {getStatusIcon()}
        <span className="text-xs sm:text-sm text-gray-300">{getLocationStatus()}</span>
      </div>

      {/* Real-time Clock Display */}
      <div className="flex items-center text-gray-300">
        <Clock className="w-4 h-4 mr-1.5 text-blue-400" />
        <span className="text-xs sm:text-sm font-medium tabular-nums">
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