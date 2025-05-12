import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { AttendanceSchedule } from '../../types';

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
  scheduleTime?: AttendanceSchedule;
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
  scheduleTime
}) => {
  const getButtonMessage = () => {
    if (!currentLocation) return "Menunggu lokasi...";
    if (!isWithinOfficeRadius()) return "Di luar area kantor";
    if (!isWithinCheckInTime() && canCheckIn) return `Waktu: ${scheduleTime?.checkIn.start} - ${scheduleTime?.checkIn.end}`;
    if (!isWithinCheckOutTime() && canCheckOut) return `Waktu: ${scheduleTime?.checkOut.start} - ${scheduleTime?.checkOut.end}`;
    return "";
  };

  return (
    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
      {canCheckIn && (
        <div className="space-y-1 sm:space-y-2">
          <button
            onClick={handleCheckIn}
            disabled={
              loading || !currentLocation || !isWithinOfficeRadius() || !isWithinCheckInTime()
            }
            className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center transition duration-200 ${
              !currentLocation || !isWithinOfficeRadius() || !isWithinCheckInTime()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
            } text-white text-sm sm:text-base`}
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            {loading ? 'Memproses...' : 'Absen Masuk'}
          </button>
          {(!isWithinCheckInTime() || !isWithinOfficeRadius()) && (
            <p className="text-xs sm:text-sm text-gray-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              {getButtonMessage()}
            </p>
          )}
        </div>
      )}

      {canCheckOut && (
        <div className="space-y-1 sm:space-y-2">
          <button
            onClick={handleCheckOut}
            disabled={
              loading || !currentLocation || !isWithinOfficeRadius() || !isWithinCheckOutTime()
            }
            className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center transition duration-200 ${
              !currentLocation || !isWithinOfficeRadius() || !isWithinCheckOutTime()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } text-white text-sm sm:text-base`}
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            {loading ? 'Memproses...' : 'Absen Keluar'}
          </button>
          {(!isWithinCheckOutTime() || !isWithinOfficeRadius()) && (
            <p className="text-xs sm:text-sm text-gray-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              {getButtonMessage()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceButtons;