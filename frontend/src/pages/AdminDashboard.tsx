import React, { useState, useEffect } from 'react';
import { Attendance } from '../types';
import AdminLayout from '../components/admin/AdminLayout';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const data = await api.attendance.getAllAttendance();
      setAttendance(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Dashboard Admin">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Ringkasan Hari Ini</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-blue-300 font-medium">Hadir</p>
              <p className="text-2xl font-bold text-blue-200">
                {attendance.filter((a) => a.status === 'present').length}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-yellow-300 font-medium">Terlambat</p>
              <p className="text-2xl font-bold text-yellow-200">
                {attendance.filter((a) => a.status === 'late').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}