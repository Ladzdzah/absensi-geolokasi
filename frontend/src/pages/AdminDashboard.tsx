import React, { useState, useEffect, useRef } from 'react';
import { User, Attendance } from '../types';
import { Download, UserPlus, LogOut, School, Users, Calendar, UserCheck, Clock, Activity, History, MapPin, Info, Save, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ATTENDANCE_RULES, OFFICE_LOCATION } from '../constants';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AdminLayout from '../components/admin/AdminLayout';
import { getMonthName, getAttendanceStats, exportMonthlyRecap } from '../utils/attendanceUtils';

// Perbaikan custom icon untuk marker
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Komponen LocationMarker yang diperbaiki
function LocationMarker({ position, setPosition }: { 
  position: [number, number]; 
  setPosition: (pos: [number, number]) => void; 
}) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <Marker 
      position={position} 
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setPosition([position.lat, position.lng]);
        },
      }}
    />
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'employee' as const,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleSettings, setScheduleSettings] = useState({
    checkIn: {
      start: ATTENDANCE_RULES.checkIn.start,
      end: ATTENDANCE_RULES.checkIn.end
    },
    checkOut: {
      start: ATTENDANCE_RULES.checkOut.start,
      end: ATTENDANCE_RULES.checkOut.end
    }
  });
  const [locationSettings, setLocationSettings] = useState({
    latitude: OFFICE_LOCATION.lat,
    longitude: OFFICE_LOCATION.lng,
    radius: OFFICE_LOCATION.radius
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    fetchUsers();
    fetchAttendance();
    loadScheduleSettings();
    loadLocationSettings();
  }, [navigate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function fetchUsers() {
    try {
      const storedUsers = localStorage.getItem('users');
      const data = storedUsers ? JSON.parse(storedUsers) : [];
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function fetchAttendance() {
    try {
      const storedAttendance = localStorage.getItem('attendance');
      const data = storedAttendance ? JSON.parse(storedAttendance) : [];
      setAttendance(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const loadScheduleSettings = () => {
    const savedSettings = localStorage.getItem('attendanceSchedule');
    if (savedSettings) {
      setScheduleSettings(JSON.parse(savedSettings));
    }
  };

  const loadLocationSettings = () => {
    const savedLocation = localStorage.getItem('officeLocation');
    if (savedLocation) {
      setLocationSettings(JSON.parse(savedLocation));
    }
  };

  const handleScheduleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('attendanceSchedule', JSON.stringify(scheduleSettings));
      setError('');
      alert('Jadwal absensi berhasil diperbarui');
    } catch (err: any) {
      setError('Gagal menyimpan jadwal: ' + err.message);
    }
  };

  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validasi nilai Latitude, Longitude, dan Radius
    if (
      locationSettings.lat < -90 || locationSettings.lat > 90 ||
      locationSettings.lng < -180 || locationSettings.lng > 180 ||
      locationSettings.radius <= 0
    ) {
      setError('Pastikan Latitude (-90 hingga 90), Longitude (-180 hingga 180), dan Radius (> 0) valid.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/office-location', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify(locationSettings),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui lokasi kantor');
      }

      setSuccess('Lokasi kantor berhasil diperbarui');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!newUser.username || !newUser.password || !newUser.full_name) {
        throw new Error('Semua field harus diisi');
      }

      if (newUser.password.length < 6) {
        throw new Error('Password harus minimal 6 karakter');
      }

      // Check for duplicate username
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.some((user: User) => user.username === newUser.username)) {
        throw new Error('Username sudah digunakan');
      }

      const newUserWithId = {
        ...newUser,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      
      const updatedUsers = [...existingUsers, newUserWithId];
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      setNewUser({ username: '', password: '', full_name: '', role: 'employee' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const formatTimeWindow = (start: string, end: string) => {
    return `${start} - ${end} WIB`;
  };

  return (
    <AdminLayout title="Dashboard Admin">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Ringkasan Hari Ini */}
      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Ringkasan Hari Ini
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-blue-300 font-medium">Hadir</p>
              <p className="text-2xl font-bold text-blue-200">
                {attendance.filter(
                  (a) =>
                    new Date(a.check_in_time).toDateString() === new Date().toDateString() &&
                    a.status === 'present'
                ).length}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-yellow-300 font-medium">Terlambat</p>
              <p className="text-2xl font-bold text-yellow-200">
                {attendance.filter(
                  (a) =>
                    new Date(a.check_in_time).toDateString() === new Date().toDateString() &&
                    a.status === 'late'
                ).length}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-green-300 font-medium">Total Hari Ini</p>
              <p className="text-2xl font-bold text-green-200">
                {attendance.filter(
                  (a) => new Date(a.check_in_time).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rekap Bulanan */}
      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden mt-8">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Rekap Bulanan
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear((prev) => prev - 1);
                  } else {
                    setSelectedMonth((prev) => prev - 1);
                  }
                }}
                className="p-1 hover:bg-indigo-500 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <span className="text-white font-medium">
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear((prev) => prev + 1);
                  } else {
                    setSelectedMonth((prev) => prev + 1);
                  }
                }}
                className="p-1 hover:bg-indigo-500 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => exportMonthlyRecap(attendance, selectedYear, selectedMonth)}
                className="ml-4 bg-gray-700 text-gray-200 px-3 py-1 rounded-lg hover:bg-gray-600 transition duration-200 flex items-center text-sm border border-gray-600"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-sm text-gray-300">Total Kehadiran</p>
              <p className="text-2xl font-bold text-gray-200">
                {getAttendanceStats(attendance, selectedYear, selectedMonth).total}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-sm text-gray-300">Hadir Tepat Waktu</p>
              <p className="text-2xl font-bold text-green-400">
                {getAttendanceStats(attendance, selectedYear, selectedMonth).present}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-sm text-gray-300">Terlambat</p>
              <p className="text-2xl font-bold text-yellow-400">
                {getAttendanceStats(attendance, selectedYear, selectedMonth).late}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-sm text-gray-300">Rata-rata Jam Masuk</p>
              <p className="text-2xl font-bold text-purple-400">
                {(() => {
                  const avg = getAttendanceStats(attendance, selectedYear, selectedMonth).averageCheckIn;
                  const hours = Math.floor(avg / 60);
                  const minutes = Math.floor(avg % 60);
                  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}