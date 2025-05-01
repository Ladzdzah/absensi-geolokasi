import React from 'react';
import { MapPin, Clock } from 'lucide-react';

interface LocationStatusProps {
  currentLocation: GeolocationPosition | null;
  isWithinOfficeRadius: () => boolean;
  currentTime: Date;
}

const LocationStatus: React.FC<LocationStatusProps> = ({
  currentLocation,
  isWithinOfficeRadius,
  currentTime,
}) => {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
        <div className="flex items-center text-gray-300">
          <MapPin className="w-5 h-5 mr-2" />
          <span className="text-sm">
            {currentLocation
              ? isWithinOfficeRadius()
                ? 'Anda berada di dalam area kantor'
                : 'Anda berada di luar area kantor'
              : 'Mendeteksi lokasi...'}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          <span className="text-lg font-semibold text-gray-200">
            {currentTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LocationStatus;