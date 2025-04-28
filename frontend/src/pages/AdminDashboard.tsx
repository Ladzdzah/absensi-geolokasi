import React, { useState, useEffect, useRef } from 'react';
import { User, Attendance } from '../types';
import { Download, UserPlus, LogOut, School, Users, Calendar, UserCheck, Clock, Activity, History, MapPin, Info, Save, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ATTENDANCE_RULES, OFFICE_LOCATION } from '../constants';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AdminLayout from '../components/AdminLayout';

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

// Add these helper functions before your component
const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString('id-ID', { month: 'long' });
};

const getAttendanceStats = (attendance: Attendance[], year: number, month: number) => {
  const filtered = attendance.filter(record => {
    const date = new Date(record.check_in_time);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  return {
    total: filtered.length,
    present: filtered.filter(record => record.status === 'present').length,
    late: filtered.filter(record => record.status === 'late').length,
    averageCheckIn: filtered.reduce((acc, record) => {
      const checkIn = new Date(record.check_in_time);
      return acc + checkIn.getHours() * 60 + checkIn.getMinutes();
    }, 0) / (filtered.length || 1),
  };
};

const exportMonthlyRecap = (attendance: Attendance[], year: number, month: number) => {
  try {
    // Filter attendance for selected month
    const monthlyAttendance = attendance.filter(record => {
      const date = new Date(record.check_in_time);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    // Prepare data for export
    const data = monthlyAttendance.map((record) => ({
      'Tanggal': new Date(record.check_in_time).toLocaleDateString('id-ID'),
      'Nama Pegawai': record.user?.full_name || 'Unknown',
      'Jam Masuk': new Date(record.check_in_time).toLocaleTimeString('id-ID'),
      'Jam Keluar': record.check_out_time 
        ? new Date(record.check_out_time).toLocaleTimeString('id-ID') 
        : '-',
      'Status': record.status === 'present' ? 'Hadir' : 'Terlambat',
      'Lokasi': `${record.latitude}, ${record.longitude}`,
    }));

    // Add summary data at the beginning
    const stats = getAttendanceStats(attendance, year, month);
    const summary = [
      {
        'Tanggal': `Rekap Bulan ${getMonthName(month)} ${year}`,
        'Nama Pegawai': '',
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Status': '',
        'Lokasi': '',
      },
      {
        'Tanggal': 'Total Kehadiran',
        'Nama Pegawai': stats.total,
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Status': '',
        'Lokasi': '',
      },
      {
        'Tanggal': 'Hadir Tepat Waktu',
        'Nama Pegawai': stats.present,
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Status': '',
        'Lokasi': '',
      },
      {
        'Tanggal': 'Terlambat',
        'Nama Pegawai': stats.late,
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Status': '',
        'Lokasi': '',
      },
      {
        'Tanggal': 'Rata-rata Jam Masuk',
        'Nama Pegawai': (() => {
          const avg = stats.averageCheckIn;
          const hours = Math.floor(avg / 60);
          const minutes = Math.floor(avg % 60);
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        })(),
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Status': '',
        'Lokasi': '',
      },
      {
        'Tanggal': '', // Empty row as separator
        'Nama Pegawai': '',
        'Jam Masuk': '',
        'Jam Keluar': '',
        'Status': '',
        'Lokasi': '',
      },
    ];

    const exportData = [...summary, ...data];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');

    // Style the worksheet
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let i = 0; i <= range.e.r; i++) {
      for (let j = 0; j <= range.e.c; j++) {
        const cell = ws[XLSX.utils.encode_cell({ r: i, c: j })];
        if (cell && i < 5) { // Summary section
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "EFEFEF" } }
          };
        }
      }
    }

    // Save the file
    XLSX.writeFile(wb, `rekap_absensi_${getMonthName(month)}_${year}.xlsx`);
  } catch (error) {
    console.error('Export error:', error);
    alert('Gagal mengexport data');
  }
};

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

  const handleLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('officeLocation', JSON.stringify(locationSettings));
      setError('');
      alert('Lokasi absensi berhasil diperbarui');
    } catch (err: any) {
      setError('Gagal menyimpan lokasi: ' + err.message);
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
    <AdminLayout title="Dashboard">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Today's Overview */}
      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Ringkasan Hari Ini
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300 font-medium">Hadir</p>
                  <p className="text-2xl font-bold text-blue-200">
                    {attendance.filter(a => 
                      new Date(a.check_in_time).toDateString() === new Date().toDateString() && 
                      a.status === 'present'
                    ).length}
                  </p>
                </div>
                <div className="bg-blue-900/50 p-2 rounded-full">
                  <UserCheck className="w-6 h-6 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300 font-medium">Terlambat</p>
                  <p className="text-2xl font-bold text-yellow-200">
                    {attendance.filter(a => 
                      new Date(a.check_in_time).toDateString() === new Date().toDateString() && 
                      a.status === 'late'
                    ).length}
                  </p>
                </div>
                <div className="bg-yellow-900/50 p-2 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-300" />
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300 font-medium">Total Hari Ini</p>
                  <p className="text-2xl font-bold text-green-200">
                    {attendance.filter(a => 
                      new Date(a.check_in_time).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <div className="bg-green-900/50 p-2 rounded-full">
                  <Users className="w-6 h-6 text-green-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-blue-300 mr-2" />
                <h3 className="text-sm font-medium text-gray-200">Jam Absen Masuk</h3>
              </div>
              <p className="text-lg font-semibold text-blue-200">
                {formatTimeWindow(ATTENDANCE_RULES.checkIn.start, ATTENDANCE_RULES.checkIn.end)}
              </p>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-purple-300 mr-2" />
                <h3 className="text-sm font-medium text-gray-200">Jam Absen Keluar</h3>
              </div>
              <p className="text-lg font-semibold text-purple-200">
                {formatTimeWindow(ATTENDANCE_RULES.checkOut.start, ATTENDANCE_RULES.checkOut.end)}
              </p>
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
              <History className="w-5 h-5 mr-2 text-gray-400" />
              Riwayat Absensi Terakhir
            </h3>
            <div className="space-y-3">
              {attendance
                .filter(a => new Date(a.check_in_time).toDateString() === new Date().toDateString())
                .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())
                .slice(0, 5)
                .map((record) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        record.status === 'present' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          {record.user?.full_name}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(record.check_in_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {record.check_out_time && (
                            <span className="ml-2">
                              - {new Date(record.check_out_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.status === 'present' 
                        ? 'bg-green-900/50 text-green-300 border border-green-700' 
                        : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                    }`}>
                      {record.status === 'present' ? 'Hadir' : 'Terlambat'}
                    </span>
                  </div>
                ))}
              {attendance.filter(a => 
                new Date(a.check_in_time).toDateString() === new Date().toDateString()
              ).length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm">
                  Belum ada absensi hari ini
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Recap Section */}
      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden mt-8">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <CalendarIcon className="w-6 h-6 mr-2" />
              Rekap Bulanan
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(prev => prev - 1);
                  } else {
                    setSelectedMonth(prev => prev - 1);
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
                    setSelectedYear(prev => prev + 1);
                  } else {
                    setSelectedMonth(prev => prev + 1);
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

        {/* Monthly Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Kehadiran</p>
                  <p className="text-2xl font-bold text-gray-200">
                    {getAttendanceStats(attendance, selectedYear, selectedMonth).total}
                  </p>
                </div>
                <div className="bg-blue-900/50 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Hadir Tepat Waktu</p>
                  <p className="text-2xl font-bold text-green-400">
                    {getAttendanceStats(attendance, selectedYear, selectedMonth).present}
                  </p>
                </div>
                <div className="bg-green-900/50 p-3 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-300" />
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Terlambat</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {getAttendanceStats(attendance, selectedYear, selectedMonth).late}
                  </p>
                </div>
                <div className="bg-yellow-900/50 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-300" />
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
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
                <div className="bg-purple-900/50 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-purple-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Attendance Table */}
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nama Pegawai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Jam Masuk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Jam Keluar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {attendance
                    .filter(record => {
                      const date = new Date(record.check_in_time);
                      return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
                    })
                    .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())
                    .map((record) => (
                      <tr key={record.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(record.check_in_time).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                          {record.user?.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(record.check_in_time).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {record.check_out_time 
                            ? new Date(record.check_out_time).toLocaleTimeString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.status === 'present'
                              ? 'bg-green-900/50 text-green-300 border border-green-700'
                              : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                          }`}>
                            {record.status === 'present' ? 'Hadir' : 'Terlambat'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2 opacity-20"></span>
        Area absensi (radius {OFFICE_LOCATION.radius}m)
      </div>
    </AdminLayout>
  );
}