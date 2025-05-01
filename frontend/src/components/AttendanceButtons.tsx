import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AttendanceButtonsProps {
  canCheckIn: boolean;
  canCheckOut: boolean;
  handleCheckIn: () => void;
  handleCheckOut: () => void;
  loading: boolean;
  isWithinOfficeRadius: () => boolean;
  isWithinCheckInTime: () => boolean;
  isWithinCheckOutTime: () => boolean;
  currentLocation: GeolocationPosition | null;
}

const AttendanceButtons: React.FC<AttendanceButtonsProps> = ({
  canCheckIn,
  canCheckOut,
  handleCheckIn,
  handleCheckOut,
  loading,
  isWithinOfficeRadius,
  isWithinCheckInTime,
  isWithinCheckOutTime,
  currentLocation,
}) => {
  return (
    <div className="space-y-4">
      {canCheckIn && (
        <button
          onClick={handleCheckIn}
          disabled={
            loading || !currentLocation || !isWithinOfficeRadius() || !isWithinCheckInTime()
          }
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition duration-200 ${
            !currentLocation || !isWithinOfficeRadius() || !isWithinCheckInTime()
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {loading ? 'Memproses...' : 'Absen Masuk'}
        </button>
      )}

      {canCheckOut && (
        <button
          onClick={handleCheckOut}
          disabled={
            loading || !currentLocation || !isWithinOfficeRadius() || !isWithinCheckOutTime()
          }
          className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center ${
            !currentLocation || !isWithinOfficeRadius() || !isWithinCheckOutTime()
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <XCircle className="w-5 h-5 mr-2" />
          {loading ? 'Memproses...' : 'Absen Keluar'}
        </button>
      )}
    </div>
  );
};

export default AttendanceButtons;