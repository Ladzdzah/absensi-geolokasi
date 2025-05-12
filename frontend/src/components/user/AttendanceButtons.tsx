import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
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
  scheduleTime
}) => {
  /**
   * Mendapatkan pesan status untuk tombol
   */
  const getButtonMessage = () => {
    if (!currentLocation) return "Menunggu lokasi...";
    if (!isWithinOfficeRadius()) return "Di luar area kantor";
    if (!isWithinCheckInTime() && canCheckIn) return "Di luar jam masuk kantor";
    if (!isWithinCheckOutTime() && canCheckOut) return "Di luar jam pulang kantor";
    return "";
  };

  return (
    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
      {/* Tombol Absen Masuk */}
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
          {/* Pesan status untuk tombol masuk */}
          {(!isWithinCheckInTime() || !isWithinOfficeRadius()) && (
            <p className="text-xs sm:text-sm text-gray-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              {getButtonMessage()}
            </p>
          )}
        </div>
      )}

      {/* Tombol Absen Keluar */}
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
          {/* Pesan status untuk tombol keluar */}
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