import React from 'react';
import { CheckCircle, Clock, LogIn, LogOut } from 'lucide-react';
import { Attendance } from '../../types';

interface TodayStatusProps {
  attendance: Attendance[];
}

const TodayStatus: React.FC<TodayStatusProps> = ({ attendance }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(
    (record) => record.check_in_time && record.check_in_time.startsWith(today)
  );

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-white">Status Hari Ini</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {todayAttendance ? (
          <div className="space-y-4">
            {/* Check In Time */}
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <LogIn className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-300">Waktu Masuk</span>
              </div>
              <span className="text-sm text-gray-300 tabular-nums">
                {new Date(todayAttendance.check_in_time).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Check Out Time */}
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <LogOut className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-300">Waktu Keluar</span>
              </div>
              <span className="text-sm text-gray-300 tabular-nums">
                {todayAttendance.check_out_time
                  ? new Date(todayAttendance.check_out_time).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '-'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 px-4">
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="w-5 h-5" />
              <p className="text-sm">Belum ada absensi hari ini</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayStatus;