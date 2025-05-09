import React from 'react';
import { Calendar, Clock, AlertCircle, Save, Info, ArrowRight } from 'lucide-react';
import { ATTENDANCE_RULES } from '../../../constants';

interface ScheduleSettingsFormProps {
  scheduleSettings: {
    checkIn: {
      start: string;
      end: string;
    };
    checkOut: {
      start: string;
      end: string;
    };
  };
  setScheduleSettings: React.Dispatch<React.SetStateAction<{
    checkIn: { start: string; end: string };
    checkOut: { start: string; end: string };
  }>>;
  handleScheduleUpdate: (e: React.FormEvent) => void;
  error: string;
  success: boolean;
  loading: boolean;
}

const ScheduleSettingsForm = ({
  scheduleSettings,
  setScheduleSettings,
  handleScheduleUpdate,
  error,
  success,
  loading,
}: ScheduleSettingsFormProps) => {
  const handleTimeChange = (type: 'checkInStart' | 'checkInEnd' | 'checkOutStart' | 'checkOutEnd', value: string) => {
    const [hours, minutes] = value.split(':');
    const h = hours.padStart(2, '0');
    const m = minutes.padStart(2, '0');
    const formattedTime = `${h}:${m}:00`;

    setScheduleSettings((prev: any) => ({
      ...prev,
      [type.includes('checkIn') ? 'checkIn' : 'checkOut']: {
        ...prev[type.includes('checkIn') ? 'checkIn' : 'checkOut'],
        [type.endsWith('Start') ? 'start' : 'end']: formattedTime,
      },
    }));
  };

  const formatTimeForDisplay = (time: string) => {
    return time ? time.slice(0, 5) : '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s infinite ease-in-out;
        }
      `}</style>
      <form onSubmit={handleScheduleUpdate} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-In Section */}
          <div className="group bg-gradient-to-br from-gray-800/70 via-gray-800/50 to-gray-800/70 p-5 rounded-xl border border-blue-500/20 backdrop-blur-sm hover:border-blue-400/30 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/15 transition-colors">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-blue-100">Check-In</h3>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Waktu Mulai</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none bg-gradient-to-r from-blue-500/15 to-blue-500/5 border-r border-blue-500/20 rounded-l-lg">
                    <Clock className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-sm" />
                  </div>
                  <input
                    type="time"
                    value={formatTimeForDisplay(scheduleSettings.checkIn.start)}
                    onChange={(e) => handleTimeChange('checkInStart', e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-gray-900/60 border border-blue-500/30 text-blue-100 text-center font-medium tracking-wider focus:ring-2 focus:ring-blue-400 focus:border-blue-400/70 hover:border-blue-400/50 transition-all duration-200"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-400 drop-shadow-sm animate-pulse-slow" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Waktu Selesai</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none bg-gradient-to-r from-blue-500/15 to-blue-500/5 border-r border-blue-500/20 rounded-l-lg">
                    <Clock className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-sm" />
                  </div>
                  <input
                    type="time"
                    value={formatTimeForDisplay(scheduleSettings.checkIn.end)}
                    onChange={(e) => handleTimeChange('checkInEnd', e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-gray-900/60 border border-blue-500/30 text-blue-100 text-center font-medium tracking-wider focus:ring-2 focus:ring-blue-400 focus:border-blue-400/70 hover:border-blue-400/50 transition-all duration-200"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-400 drop-shadow-sm animate-pulse-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Check-Out Section */}
          <div className="group bg-gradient-to-br from-gray-800/70 via-gray-800/50 to-gray-800/70 p-5 rounded-xl border border-blue-500/20 backdrop-blur-sm hover:border-blue-400/30 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/15 transition-colors">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-blue-100">Check-Out</h3>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Waktu Mulai</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none bg-gradient-to-r from-blue-500/15 to-blue-500/5 border-r border-blue-500/20 rounded-l-lg">
                    <Clock className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-sm" />
                  </div>
                  <input
                    type="time"
                    value={formatTimeForDisplay(scheduleSettings.checkOut.start)}
                    onChange={(e) => handleTimeChange('checkOutStart', e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-gray-900/60 border border-blue-500/30 text-blue-100 text-center font-medium tracking-wider focus:ring-2 focus:ring-blue-400 focus:border-blue-400/70 hover:border-blue-400/50 transition-all duration-200"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-400 drop-shadow-sm animate-pulse-slow" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Waktu Selesai</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none bg-gradient-to-r from-blue-500/15 to-blue-500/5 border-r border-blue-500/20 rounded-l-lg">
                    <Clock className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-sm" />
                  </div>
                  <input
                    type="time"
                    value={formatTimeForDisplay(scheduleSettings.checkOut.end)}
                    onChange={(e) => handleTimeChange('checkOutEnd', e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-gray-900/60 border border-blue-500/30 text-blue-100 text-center font-medium tracking-wider focus:ring-2 focus:ring-blue-400 focus:border-blue-400/70 hover:border-blue-400/50 transition-all duration-200"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-400 drop-shadow-sm animate-pulse-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
            <Info className="w-4 h-4 text-emerald-400" />
            <p className="text-sm text-emerald-200">Jadwal berhasil diperbarui!</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium overflow-hidden shadow-md hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            <Save className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{loading ? 'Menyimpan...' : 'Simpan Jadwal'}</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 z-10 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleSettingsForm;