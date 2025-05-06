import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface TodayStatusProps {
  attendance: any[];
}

const TodayStatus: React.FC<TodayStatusProps> = ({ attendance }) => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const todayAttendance = attendance.find(
    (record) => record.check_in_time && record.check_in_time.startsWith(today)
  );

  return (
    <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">Status Hari Ini</h3>
      {todayAttendance ? (
        <div>
          <p className="text-gray-200">
            Waktu Masuk: {new Date(todayAttendance.check_in_time).toLocaleTimeString('id-ID')}
          </p>
          <p className="text-gray-200">
            Waktu Keluar: {todayAttendance.check_out_time
              ? new Date(todayAttendance.check_out_time).toLocaleTimeString('id-ID')
              : '-'}
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Belum ada absensi hari ini</p>
      )}
    </div>
  );
};

export default TodayStatus;