import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import ScheduleSettingsForm from '../components/admin/schedule/ScheduleSettingsForm';
import { api } from '../services/api';
import { Clock, Calendar } from 'lucide-react';

export default function ScheduleSettings() {
  const [scheduleSettings, setScheduleSettings] = useState({
    checkIn: { start: '', end: '' },
    checkOut: { start: '', end: '' }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = async () => {
    try {
      const data = await api.schedule.get();
      setScheduleSettings({
        checkIn: { 
          start: data.check_in_start || '00:00:00', 
          end: data.check_in_end || '00:00:00' 
        },
        checkOut: { 
          start: data.check_out_start || '00:00:00', 
          end: data.check_out_end || '00:00:00' 
        }
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleScheduleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const validateTimeFormat = (time: string) => {
        return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
      };

      const { checkIn, checkOut } = scheduleSettings;

      const formatTime = (time: string) => {
        if (!time) return '00:00:00';
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      };

      const formattedSchedule = {
        check_in_start: formatTime(checkIn.start),
        check_in_end: formatTime(checkIn.end),
        check_out_start: formatTime(checkOut.start),
        check_out_end: formatTime(checkOut.end)
      };

      if (!validateTimeFormat(formattedSchedule.check_in_start) || 
          !validateTimeFormat(formattedSchedule.check_in_end) ||
          !validateTimeFormat(formattedSchedule.check_out_start) || 
          !validateTimeFormat(formattedSchedule.check_out_end)) {
        throw new Error('Format waktu tidak valid (HH:mm:ss)');
      }

      await api.schedule.update(formattedSchedule);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="">
      <div className="min-h-screen from-gray-900 via-gray-800 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl mb-4 backdrop-blur-sm border border-blue-500/20">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Pengaturan Jadwal Absensi
            </h1>
            <p className="text-base text-blue-300/90">
              Atur waktu check-in dan check-out untuk sistem absensi
            </p>
          </div>

          {/* Time Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-500/10 px-4 py-3 rounded-lg border border-blue-400/20 backdrop-blur-sm group hover:bg-blue-500/15 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-300" />
                  <span className="text-sm text-blue-200">Jam Masuk</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {scheduleSettings.checkIn.start.slice(0, 5)} - {scheduleSettings.checkIn.end.slice(0, 5)}
                </span>
              </div>
            </div>

            <div className="bg-blue-500/10 px-4 py-3 rounded-lg border border-blue-400/20 backdrop-blur-sm group hover:bg-blue-500/15 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-300" />
                  <span className="text-sm text-blue-200">Jam Pulang</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {scheduleSettings.checkOut.start.slice(0, 5)} - {scheduleSettings.checkOut.end.slice(0, 5)}
                </span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20">
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 px-6 py-4 border-b border-blue-500/20">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Pengaturan Waktu
              </h2>
            </div>
            
            <ScheduleSettingsForm
              scheduleSettings={scheduleSettings}
              setScheduleSettings={setScheduleSettings}
              handleScheduleUpdate={handleScheduleUpdate}
              error={error}
              success={success}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}