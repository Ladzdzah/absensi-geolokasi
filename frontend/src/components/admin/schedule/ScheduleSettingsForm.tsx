import React, { useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Save, Info } from 'lucide-react';
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

const TimeInput = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (time: string) => void;
}) => {
  const [hours, minutes] = value.split(':');

  const handleTimeChange = (type: 'hours' | 'minutes', newValue: string) => {
    let h = type === 'hours' ? newValue : hours;
    let m = type === 'minutes' ? newValue : minutes;

    h = h.padStart(2, '0').slice(0, 2);
    m = m.padStart(2, '0').slice(0, 2);

    if (parseInt(h) > 23) h = '23';
    if (parseInt(m) > 59) m = '59';

    onChange(`${h}:${m}`);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-gray-400 font-medium min-w-[100px]">
        {label}
      </label>
      <div className="flex items-center bg-gray-800/80 rounded-xl border border-gray-600/50 p-1.5 hover:border-gray-500/50 transition-colors">
        <input
          type="number"
          value={hours}
          onChange={(e) => handleTimeChange('hours', e.target.value)}
          className="w-14 h-10 bg-transparent border-none text-center text-white focus:ring-0 text-xl font-medium [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="00"
          min="0"
          max="23"
        />
        <span className="text-blue-400 text-2xl font-light px-0.5 select-none">:</span>
        <input
          type="number"
          value={minutes}
          onChange={(e) => handleTimeChange('minutes', e.target.value)}
          className="w-14 h-10 bg-transparent border-none text-center text-white focus:ring-0 text-xl font-medium [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="00"
          min="0"
          max="59"
        />
      </div>
    </div>
  );
};

export const ScheduleSettingsForm: React.FC<ScheduleSettingsFormProps> = ({
  scheduleSettings,
  setScheduleSettings,
  handleScheduleUpdate,
  error,
  success,
  loading,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/10 backdrop-blur-sm border border-blue-500/20 p-4 mb-8 rounded-xl">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
          <p className="text-sm text-gray-300 leading-relaxed">
            Atur jadwal absensi untuk absen masuk dan keluar pegawai. Pastikan rentang waktu sudah sesuai dengan kebijakan perusahaan.
          </p>
        </div>
      </div>

      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/30">
        <div className="p-6 border-b border-gray-700/30 text-center">
          <h2 className="text-xl font-medium text-white inline-flex items-center">
            <Calendar className="w-5 h-5 mr-3 text-blue-400" />
            Pengaturan Jadwal Absensi
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleScheduleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Check-in Section */}
              <div className="bg-gray-800/50 p-6 rounded-xl">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500/10 p-2.5 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white ml-3">Absen Masuk</h3>
                </div>
                <div className="space-y-6">
                  <TimeInput
                    label="Waktu Mulai"
                    value={scheduleSettings.checkIn.start}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkIn: { ...scheduleSettings.checkIn, start: time }
                    })}
                  />
                  <TimeInput
                    label="Waktu Selesai"
                    value={scheduleSettings.checkIn.end}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkIn: { ...scheduleSettings.checkIn, end: time }
                    })}
                  />
                </div>
              </div>

              {/* Check-out Section - mirror styles from check-in */}
              <div className="bg-gray-800/50 p-6 rounded-xl">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500/10 p-2.5 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white ml-3">Absen Keluar</h3>
                </div>
                <div className="space-y-6">
                  <TimeInput
                    label="Waktu Mulai"
                    value={scheduleSettings.checkOut.start}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkOut: { ...scheduleSettings.checkOut, start: time }
                    })}
                  />
                  <TimeInput
                    label="Waktu Selesai"
                    value={scheduleSettings.checkOut.end}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkOut: { ...scheduleSettings.checkOut, end: time }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            {(error || success) && (
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                error 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                {error ? <AlertCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                <p className="text-sm">{error || 'Jadwal berhasil disimpan'}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};