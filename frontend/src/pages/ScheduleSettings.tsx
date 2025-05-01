import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Save, Info } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { ATTENDANCE_RULES } from '../constants';

export default function ScheduleSettings() {
  const [scheduleSettings, setScheduleSettings] = useState({
    checkIn: {
      start: ATTENDANCE_RULES.checkIn.start,
      end: ATTENDANCE_RULES.checkIn.end,
    },
    checkOut: {
      start: ATTENDANCE_RULES.checkOut.start,
      end: ATTENDANCE_RULES.checkOut.end,
    },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScheduleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validasi waktu
      if (scheduleSettings.checkIn.end <= scheduleSettings.checkIn.start) {
        throw new Error('Waktu selesai check-in harus lebih besar dari waktu mulai');
      }
      if (scheduleSettings.checkOut.end <= scheduleSettings.checkOut.start) {
        throw new Error('Waktu selesai check-out harus lebih besar dari waktu mulai');
      }

      const response = await fetch('http://localhost:5000/api/admin/attendance-schedule', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify({
          check_in_start: scheduleSettings.checkIn.start,
          check_in_end: scheduleSettings.checkIn.end,
          check_out_start: scheduleSettings.checkOut.start,
          check_out_end: scheduleSettings.checkOut.end,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui jadwal absensi');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/attendance-schedule', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${localStorage.getItem('authToken')}` 
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil jadwal absensi');
        }

        const data = await response.json();
        setScheduleSettings({
          checkIn: { start: data.check_in_start, end: data.check_in_end },
          checkOut: { start: data.check_out_start, end: data.check_out_end },
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <AdminLayout title="Pengaturan Jadwal Absensi">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Waktu Mulai
                      </label>
                      <input
                        type="time"
                        value={scheduleSettings.checkIn.start}
                        onChange={(e) =>
                          setScheduleSettings({
                            ...scheduleSettings,
                            checkIn: { ...scheduleSettings.checkIn, start: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-lg bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Waktu Selesai
                      </label>
                      <input
                        type="time"
                        value={scheduleSettings.checkIn.end}
                        onChange={(e) =>
                          setScheduleSettings({
                            ...scheduleSettings,
                            checkIn: { ...scheduleSettings.checkIn, end: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-lg bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Check-out Section */}
                <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                  <div className="flex items-center mb-4">
                    <Clock className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="text-lg font-medium text-white">Jadwal absen keluar</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Waktu Mulai
                      </label>
                      <input
                        type="time"
                        value={scheduleSettings.checkOut.start}
                        onChange={(e) =>
                          setScheduleSettings({
                            ...scheduleSettings,
                            checkOut: { ...scheduleSettings.checkOut, start: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-lg bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Waktu Selesai
                      </label>
                      <input
                        type="time"
                        value={scheduleSettings.checkOut.end}
                        onChange={(e) =>
                          setScheduleSettings({
                            ...scheduleSettings,
                            checkOut: { ...scheduleSettings.checkOut, end: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-lg bg-gray-600 border-gray-500 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
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
                      <p className="text-sm text-green-300">{success} Berhasil menetapkan waktu absen</p>
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
    </AdminLayout>
  );
}