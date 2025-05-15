import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { AttendanceSchedule } from '../../types';

/**
 * Interface untuk properti komponen tombol absensi
 */
interface AttendanceButtonsProps {
  canCheckIn: boolean;             // Status apakah bisa melakukan check-in
  canCheckOut: boolean;            // Status apakah bisa melakukan check-out
  handleCheckIn: () => void;       // Fungsi untuk menangani check-in
  handleCheckOut: () => void;      // Fungsi untuk menangani check-out
  loading: boolean;                // Status loading
  isWithinOfficeRadius: () => boolean;  // Fungsi untuk memeriksa apakah berada dalam radius kantor
  isWithinCheckInTime: () => boolean;   // Fungsi untuk memeriksa apakah berada dalam waktu check-in
  isWithinCheckOutTime: () => boolean;  // Fungsi untuk memeriksa apakah berada dalam waktu check-out
  currentLocation: GeolocationPosition | null;  // Data lokasi saat ini
  scheduleTime?: AttendanceSchedule;    // Jadwal waktu absensi
  hasCheckedInToday: boolean;
}

/**
 * Komponen untuk menampilkan tombol absensi (check-in dan check-out)
 * dengan validasi lokasi dan waktu
 */
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
  scheduleTime,
  hasCheckedInToday
}) => {
  /**
   * Mendapatkan pesan status untuk tombol
   */
  const getButtonMessage = () => {
    if (!currentLocation) {
      return {
        text: "Menunggu lokasi...",
        icon: <Clock className="w-4 h-4" />,
        color: "text-yellow-400"
      };
    }
    
    if (!isWithinOfficeRadius()) {
      return {
        text: "Di luar area kantor",
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-red-400"
      };
    }
    
    return {
      text: "",
      icon: null,
      color: ""
    };
  };

  const buttonMessage = getButtonMessage();

  // Hanya cek lokasi untuk kedua tombol
  const isButtonDisabled = !currentLocation || !isWithinOfficeRadius() || loading;

  return (
    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
      {/* Status Message */}
      {buttonMessage.text && (
        <div className={`flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/50 ${buttonMessage.color}`}>
          {buttonMessage.icon}
          <span className="text-sm">{buttonMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Check-in Button */}
        <button
          onClick={handleCheckIn}
          disabled={isButtonDisabled}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${!isButtonDisabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'}`}
        >
          <CheckCircle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Absen Masuk</span>
        </button>

        {/* Check-out Button */}
        <button
          onClick={handleCheckOut}
          disabled={isButtonDisabled}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${!isButtonDisabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'}`}
        >
          <XCircle className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Absen Pulang</span>
        </button>
      </div>

      {scheduleTime && (
        <div className="text-xs text-gray-400 text-center space-y-1">
          <p className="text-yellow-500">*Jadwal hanya sebagai informasi</p>
          <p>Jam Masuk: {scheduleTime.check_in_start.slice(0, 5)} - {scheduleTime.check_in_end.slice(0, 5)}</p>
          <p>Jam Pulang: {scheduleTime.check_out_start.slice(0, 5)} - {scheduleTime.check_out_end.slice(0, 5)}</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceButtons;