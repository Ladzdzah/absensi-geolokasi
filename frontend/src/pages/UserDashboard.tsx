import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Attendance } from '../types';
import { Clock, LogOut, School, CheckCircle, XCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/leaflet.css';
import UserLayout from '../components/user/UserLayout'; // Import UserLayout
import LocationMap from '../components/user/LocationMap';
import LocationStatus from '../components/user/LocationStatus';
import AttendanceButtons from '../components/user/AttendanceButtons';
import TodayStatus from '../components/user/TodayStatus';

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

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function UserDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [note, setNote] = useState('');
  const [officeLocation, setOfficeLocation] = useState({ lat: 0, lng: 0, radius: 0 });
  const [attendanceSchedule, setAttendanceSchedule] = useState({
    checkIn: { start: '', end: '' },
    checkOut: { start: '', end: '' },
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
    fetchOfficeLocation(); // Ambil data lokasi kantor dari backend
    getCurrentLocation(); // Ambil lokasi perangkat pengguna
    fetchAttendanceSchedule(); // Ambil jadwal absensi dari backend
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Perbarui setiap 1 detik

    return () => clearInterval(interval); // Bersihkan interval saat komponen di-unmount
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/attendance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data absensi");
      }

      const data = await response.json();
      setAttendance(data); // Simpan data ke state
    } catch (error: any) {
      setError(error.message);
    }
  };

  function getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation(position),
        (error) => setError('Error mendapatkan lokasi: ' + error.message)
      );
    } else {
      setError('Geolocation tidak didukung oleh browser Anda');
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
      setOfficeLocation({ lat: data.lat, lng: data.lng, radius: data.radius }); // Simpan data ke state
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchAttendanceSchedule = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/attendance-schedule', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil jadwal absensi');
      }

      const data = await response.json();
      setAttendanceSchedule({
        checkIn: { start: data.check_in_start, end: data.check_in_end },
        checkOut: { start: data.check_out_start, end: data.check_out_end },
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Add function to check if user is within office radius

  const isWithinOfficeRadius = () => {
    if (!currentLocation) return false;

    const userLat = currentLocation.coords.latitude;
    const userLng = currentLocation.coords.longitude;

    // Menghitung jarak menggunakan rumus Haversine
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = (userLat * Math.PI) / 180;
    const φ2 = (officeLocation.lat * Math.PI) / 180;
    const Δφ = ((officeLocation.lat - userLat) * Math.PI) / 180;
    const Δλ = ((officeLocation.lng - userLng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= officeLocation.radius;
  };

  const isWithinCheckInTime = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    return (
      currentTime >= attendanceSchedule.checkIn.start &&
      currentTime <= attendanceSchedule.checkIn.end
    );
  };

  const isWithinCheckOutTime = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    return (
      currentTime >= attendanceSchedule.checkOut.start &&
      currentTime <= attendanceSchedule.checkOut.end
    );
  };

  // Modify handleCheckIn to include location validation
  const handleCheckIn = async () => {
    if (!currentLocation) {
      setError("Lokasi tidak ditemukan");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/admin/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          status: "present", // Atur status sesuai logika
        }),
      });
  
      if (!response.ok) {
        throw new Error("Gagal melakukan absensi masuk");
      }
  
      fetchAttendance(); // Perbarui data absensi
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) {
      setError("Lokasi tidak ditemukan");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/admin/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Gagal melakukan absensi keluar");
      }
  
      fetchAttendance(); // Perbarui data absensi
    } catch (error: any) {
      setError(error.message);
    }
  };

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
    <UserLayout>
      <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Location Section */}
        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Lokasi Anda Saat Ini</h2>
          </div>
          <div className="p-6">
            <LocationMap currentLocation={currentLocation} />
            <LocationStatus
              currentLocation={currentLocation}
              isWithinOfficeRadius={isWithinOfficeRadius}
              currentTime={currentTime}
            />
            <AttendanceButtons
              canCheckIn={canCheckIn}
              canCheckOut={!!canCheckOut}
              handleCheckIn={handleCheckIn}
              handleCheckOut={handleCheckOut}
              loading={loading}
              isWithinOfficeRadius={isWithinOfficeRadius}
              isWithinCheckInTime={isWithinCheckInTime}
              isWithinCheckOutTime={isWithinCheckOutTime}
              currentLocation={currentLocation}
            />
          </div>
        </div>

        {/* Today's Status */}
        <TodayStatus attendance={attendance} />
      </div>
    </UserLayout>
  );
}