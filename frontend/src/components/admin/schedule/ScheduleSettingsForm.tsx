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
  onChange, 
  name 
}: { 
  label: string; 
  value: string; 
  onChange: (time: string) => void;
  name: string;
}) => {
  // Parse hours and minutes from value
  const [hours, minutes] = value.split(':');

  const handleTimeChange = (type: 'hours' | 'minutes', newValue: string) => {
    let h = type === 'hours' ? newValue : hours;
    let m = type === 'minutes' ? newValue : minutes;

    // Validate hours
    if (parseInt(h) > 23) h = '23';
    if (parseInt(h) < 0) h = '00';
    if (h.length === 1) h = `0${h}`;

    // Validate minutes
    if (parseInt(m) > 59) m = '59';
    if (parseInt(m) < 0) m = '00';
    if (m.length === 1) m = `0${m}`;

    onChange(`${h}:${m}`);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={hours}
            onChange={(e) => handleTimeChange('hours', e.target.value)}
            className="block w-full pl-4 pr-12 py-2.5 rounded-lg bg-gray-600 border border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            placeholder="00"
            min="0"
            max="23"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400 text-sm">jam</span>
          </div>
        </div>
        <span className="text-gray-400 text-xl">:</span>
        <div className="relative flex-1">
          <input
            type="number"
            value={minutes}
            onChange={(e) => handleTimeChange('minutes', e.target.value)}
            className="block w-full pl-4 pr-12 py-2.5 rounded-lg bg-gray-600 border border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            placeholder="00"
            min="0"
            max="59"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400 text-sm">menit</span>
          </div>
        </div>
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
      <div className="bg-gray-800 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-300">
              Atur jadwal absensi untuk absen masuk dan keluar pegawai. Pastikan rentang waktu sudah sesuai dengan kebijakan perusahaan.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Form Pengaturan Jadwal
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleScheduleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Check-in Section */}
              <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-blue-400 mr-2" />
                  <h3 className="text-lg font-medium text-white">Jadwal absen masuk</h3>
                </div>
                <div className="space-y-4">
                  <TimeInput
                    label="Waktu Mulai"
                    value={scheduleSettings.checkIn.start}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkIn: { ...scheduleSettings.checkIn, start: time }
                    })}
                    name="checkInStart"
                  />
                  <TimeInput
                    label="Waktu Selesai"
                    value={scheduleSettings.checkIn.end}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkIn: { ...scheduleSettings.checkIn, end: time }
                    })}
                    name="checkInEnd"
                  />
                </div>
              </div>

              {/* Check-out Section */}
              <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-blue-400 mr-2" />
                  <h3 className="text-lg font-medium text-white">Jadwal absen keluar</h3>
                </div>
                <div className="space-y-4">
                  <TimeInput
                    label="Waktu Mulai"
                    value={scheduleSettings.checkOut.start}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkOut: { ...scheduleSettings.checkOut, start: time }
                    })}
                    name="checkOutStart"
                  />
                  <TimeInput
                    label="Waktu Selesai"
                    value={scheduleSettings.checkOut.end}
                    onChange={(time) => setScheduleSettings({
                      ...scheduleSettings,
                      checkOut: { ...scheduleSettings.checkOut, end: time }
                    })}
                    name="checkOutEnd"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-900 border-l-4 border-green-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Save className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-300">Berhasil menetapkan waktu absen</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};