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
    if (!isWithinCheckInTime() && canCheckIn) return `Waktu absen: ${scheduleTime?.checkIn.start} - ${scheduleTime?.checkIn.end}`;
    if (!isWithinCheckOutTime() && canCheckOut) return `Waktu absen: ${scheduleTime?.checkOut.start} - ${scheduleTime?.checkOut.end}`;
    return "";
  };

  return (
    <div className="mt-6 space-y-4">
      {canCheckIn && (
        <div className="space-y-2">
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
          {(!isWithinCheckInTime() || !isWithinOfficeRadius()) && (
            <p className="text-sm text-gray-400 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              {getButtonMessage()}
            </p>
          )}
        </div>
      )}

      {canCheckOut && (
        <div className="space-y-2">
          <button
            onClick={handleCheckOut}
            disabled={
              loading || !currentLocation || !isWithinOfficeRadius() || !isWithinCheckOutTime()
            }
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition duration-200 ${
              !currentLocation || !isWithinOfficeRadius() || !isWithinCheckOutTime()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <XCircle className="w-5 h-5 mr-2" />
            {loading ? 'Memproses...' : 'Absen Keluar'}
          </button>
          {(!isWithinCheckOutTime() || !isWithinOfficeRadius()) && (
            <p className="text-sm text-gray-400 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              {getButtonMessage()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceButtons;