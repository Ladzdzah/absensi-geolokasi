import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

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
      <div className="space-y-4">
        {todayAttendance ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${
                  todayAttendance.status === 'present'
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                }`}
              >
                {todayAttendance.status === 'present' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tepat Waktu
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Terlambat
                  </>
                )}
              </span>
            </div>

            {/* Time Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400 mb-1">Waktu Masuk</p>
                <p className="text-lg font-semibold text-gray-200">
                  {new Date(todayAttendance.check_in_time).toLocaleTimeString('id-ID')}
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400 mb-1">Waktu Keluar</p>
                <p className="text-lg font-semibold text-gray-200">
                  {todayAttendance.check_out_time
                    ? new Date(todayAttendance.check_out_time).toLocaleTimeString('id-ID')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Belum ada absensi hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayStatus;