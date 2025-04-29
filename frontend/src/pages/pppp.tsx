import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Attendance } from '../types';
import { MapPin, Clock, LogOut, School, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Add the same ATTENDANCE_RULES constant at the top of EmployeeDashboard.tsx
const ATTENDANCE_RULES = {
  checkIn: {
    start: '07:00',
    end: '07:30',
  },
  checkOut: {
    start: '15:30',
    end: '16:00',
  }
};

// Add this after the office location constant
const OFFICE_LOCATION = {
  lat: -7.131797383467196,
  lng: 109.65653657951286,
  radius: 20, // Radius in meters for check-in area
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [note, setNote] = useState('');
  const [officeLocation, setOfficeLocation] = useState({ lat: 0, lng: 0, radius: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
    getCurrentLocation();
    fetchOfficeLocation();
  }, []);

  async function fetchAttendance() {
    if (!user) return;
    
    try {
      // Get attendance from localStorage
      const storedAttendance = localStorage.getItem('attendance');
      const allAttendance = storedAttendance ? JSON.parse(storedAttendance) : [];
      
      // Filter attendance for current user
      const userAttendance = allAttendance.filter((a: Attendance) => a.user_id === user.id);
      
      // Sort by check-in time (newest first)
      userAttendance.sort((a: Attendance, b: Attendance) => 
        new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
      );
      
      setAttendance(userAttendance);
    } catch (error: any) {
      setError(error.message);
    }
  }

  function getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation(position),
        (error) => setError('Error getting location: ' + error.message)
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }

  const fetchOfficeLocation = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/office-location', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('authToken')}` 
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil lokasi kantor');
      }

      const data = await response.json();
      setOfficeLocation({ lat: data.lat, lng: data.lng, radius: data.radius });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Add function to check if user is within office radius
  const isWithinOfficeRadius = () => {
    if (!currentLocation) return false;
    
    const userLat = currentLocation.coords.latitude;
    const userLng = currentLocation.coords.longitude;
    
    // Calculate distance using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (userLat * Math.PI) / 180;
    const φ2 = (OFFICE_LOCATION.lat * Math.PI) / 180;
    const Δφ = ((OFFICE_LOCATION.lat - userLat) * Math.PI) / 180;
    const Δλ = ((OFFICE_LOCATION.lng - userLng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= OFFICE_LOCATION.radius;
  };

  // Modify handleCheckIn to include location validation
  async function handleCheckIn() {
    if (!user || !currentLocation) return;
    
    if (!isWithinOfficeRadius()) {
      setError('Anda harus berada di area kantor untuk melakukan absensi');
      return;
    }
    
    setLoading(true);
    setError('');

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    
    // Check if current time is within check-in window
    if (currentTime < ATTENDANCE_RULES.checkIn.start || currentTime > ATTENDANCE_RULES.checkIn.end) {
      setError(`Waktu absen masuk hanya diperbolehkan antara ${ATTENDANCE_RULES.checkIn.start} - ${ATTENDANCE_RULES.checkIn.end} WIB`);
      setLoading(false);
      return;
    }

    const status = currentTime > ATTENDANCE_RULES.checkIn.end ? 'late' : 'present';

    try {
      // Get existing attendance records
      const storedAttendance = localStorage.getItem('attendance');
      const existingAttendance = storedAttendance ? JSON.parse(storedAttendance) : [];
      
      // Create new attendance record
      const newAttendance = {
        id: Date.now().toString(),
        user_id: user.id,
        user: user, // Include user data for easier display
        check_in_time: now.toISOString(),
        check_out_time: null,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        status,
        note,
        created_at: now.toISOString()
      };
      
      // Add to existing records
      const updatedAttendance = [...existingAttendance, newAttendance];
      
      // Save to localStorage
      localStorage.setItem('attendance', JSON.stringify(updatedAttendance));

      fetchAttendance();
      setNote('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    if (!user || !currentLocation) return;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    
    // Check if current time is within check-out window
    if (currentTime < ATTENDANCE_RULES.checkOut.start || currentTime > ATTENDANCE_RULES.checkOut.end) {
      setError(`Waktu absen keluar hanya diperbolehkan antara ${ATTENDANCE_RULES.checkOut.start} - ${ATTENDANCE_RULES.checkOut.end} WIB`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get existing attendance records
      const storedAttendance = localStorage.getItem('attendance');
      const existingAttendance = storedAttendance ? JSON.parse(storedAttendance) : [];
      
      // Find the most recent check-in record for the user that doesn't have a check-out time
      const recordIndex = existingAttendance.findIndex((record: Attendance) => 
        record.user_id === user.id && !record.check_out_time
      );
      
      if (recordIndex === -1) {
        throw new Error('No active check-in found');
      }
      
      // Update record with check-out time
      existingAttendance[recordIndex] = {
        ...existingAttendance[recordIndex],
        check_out_time: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('attendance', JSON.stringify(existingAttendance));

      fetchAttendance();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      // Remove auth token from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      navigate('/login');
    } catch (error) {
      setError('Failed to logout');
    }
  }

  const canCheckIn = !attendance.length || attendance[0].check_out_time !== null;
  const canCheckOut =
    attendance.length > 0 && attendance[0].check_in_time && !attendance[0].check_out_time;

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <img 
                src="/images/logo-smk.png" 
                alt="Logo SMK" 
                className="h-11 w-auto"
                onError={(e) => {
                  const imgElement = e.currentTarget as HTMLImageElement;
                  imgElement.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold text-gray-100">
                ABSENSI PEGAWAI
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Absensi Masuk/Keluar
              </h2>
            </div>
            <div className="p-6">
              {/* Current Location Map */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Lokasi Anda Saat Ini</h3>
                <div className="h-[300px] rounded-lg overflow-hidden border border-gray-600">
                  <MapContainer
                    center={[OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {/* Office Marker */}
                    <Marker position={[OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">Lokasi Kantor</h3>
                          <p className="text-sm text-gray-600">
                            Area absensi dalam radius {OFFICE_LOCATION.radius}m
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                    {/* Office Radius */}
                    <Circle
                      center={[OFFICE_LOCATION.lat, OFFICE_LOCATION.lng]}
                      radius={OFFICE_LOCATION.radius}
                      pathOptions={{
                        color: '#2563eb',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.2
                      }}
                    />
                    {/* User Current Location */}
                    {currentLocation && (
                      <Marker
                        position={[
                          currentLocation.coords.latitude,
                          currentLocation.coords.longitude
                        ]}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold">Lokasi Anda</h3>
                            <p className="text-sm text-gray-600">
                              {isWithinOfficeRadius() 
                                ? "✓ Di dalam area kantor"
                                : "✗ Di luar area kantor"}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                {/* Location Status */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center text-gray-300">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-sm">
                        {currentLocation 
                          ? isWithinOfficeRadius()
                            ? "Anda berada di dalam area kantor"
                            : "Anda berada di luar area kantor"
                          : "Mendeteksi lokasi..."}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-400" />
                      <span className="text-lg font-semibold text-gray-200">
                        {new Date().toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2 opacity-20"></span>
                    Area absensi kantor (radius {OFFICE_LOCATION.radius}m)
                  </div>
                </div>
              </div>

              {/* Check In/Out buttons */}
              <div className="space-y-4">
                {canCheckIn && (
                  <button
                    onClick={handleCheckIn}
                    disabled={loading || !currentLocation || !isWithinOfficeRadius()}
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition duration-200 ${
                      !currentLocation || !isWithinOfficeRadius()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {loading ? 'Memproses...' : 'Absen Masuk'}
                  </button>
                )}

                {canCheckOut && (
                  <button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    {loading ? 'Memproses...' : 'Absen Keluar'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Status Hari Ini
              </h2>
            </div>
            <div className="p-6">
              {attendance[0] ? (
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <span
                      className={`px-6 py-2 rounded-full text-base font-semibold flex items-center ${
                        attendance[0].status === 'present'
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                      }`}
                    >
                      {attendance[0].status === 'present' ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Tepat Waktu
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 mr-2" />
                          Terlambat
                        </>
                      )}
                    </span>
                  </div>

                  {/* Time Details */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Check In Time */}
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Waktu Masuk</p>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-lg font-semibold text-gray-200">
                            {new Date(attendance[0].check_in_time).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Check Out Time */}
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Waktu Keluar</p>
                        <div className="flex items-center justify-center space-x-2">
                          {attendance[0].check_out_time ? (
                            <>
                              <XCircle className="w-4 h-4 text-blue-400" />
                              <span className="text-lg font-semibold text-gray-200">
                                {new Date(attendance[0].check_out_time).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-semibold text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="text-center pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      {new Date(attendance[0].check_in_time).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Belum ada absensi hari ini</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-purple-900 to-purple-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Riwayat Absensi</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Masuk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Keluar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(record.check_in_time).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(record.check_in_time).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {record.check_out_time
                          ? new Date(record.check_out_time).toLocaleTimeString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'present'
                              ? 'bg-green-900/50 text-green-300 border border-green-700'
                              : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                          }`}
                        >
                          {record.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}