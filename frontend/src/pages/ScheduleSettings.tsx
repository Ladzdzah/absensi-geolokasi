import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { ScheduleSettingsForm } from '../components/admin/schedule/ScheduleSettingsForm';
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

  const handleScheduleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
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

  return (
    <AdminLayout title="Pengaturan Jadwal Absensi">
      <ScheduleSettingsForm
        scheduleSettings={scheduleSettings}
        setScheduleSettings={setScheduleSettings}
        handleScheduleUpdate={handleScheduleUpdate}
        error={error}
        success={success}
        loading={loading}
      />
    </AdminLayout>
  );
}