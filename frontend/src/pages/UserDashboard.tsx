import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Attendance } from '../types';
import UserLayout from '../components/user/UserLayout';
import LocationMap from '../components/user/LocationMap';
import LocationStatus from '../components/user/LocationStatus';
import AttendanceButtons from '../components/user/AttendanceButtons';
import TodayStatus from '../components/user/TodayStatus';
import { api } from '../services/api';
import { format, isToday, parseISO, isSameDay } from 'date-fns';
import { AlertCircle, CheckCircle, X, Info } from 'lucide-react';

/**
 * UserDashboard: Halaman utama untuk pengguna biasa (non-admin).
 * Menampilkan komponen untuk melakukan absensi dan melihat status kehadiran hari ini.
 */
export default function UserDashboard() {
  // State untuk data pengguna dan kehadiran
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  
  // State untuk lokasi dan jarak
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<GeolocationPositionError | null>(null);
  const [officeLocation, setOfficeLocation] = useState({
    lat: 0,
    lng: 0,
    radius: 100
  });
  const [officeDistance, setOfficeDistance] = useState<number | null>(null);
  const [today] = useState(new Date());
  
  // State untuk notifikasi
  const [activeNotification, setActiveNotification] = useState<{id: string; type: 'error' | 'success' | 'info'; message: string} | null>(null);
  const [notificationTimeout, setNotificationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mengambil data saat komponen dimuat
  useEffect(() => {
    fetchAttendance();
    startLocationTracking();
    fetchOfficeLocation();
  }, []);

  // Menghitung jarak ke kantor saat lokasi berubah
  useEffect(() => {
    if (currentLocation && officeLocation.lat !== 0 && officeLocation.lng !== 0) {
      const distance = calculateDistance(
        { 
          latitude: currentLocation.coords.latitude, 
          longitude: currentLocation.coords.longitude 
        },
        { 
          latitude: officeLocation.lat, 
          longitude: officeLocation.lng 
        }
      );
      setOfficeDistance(distance);
    }
  }, [currentLocation, officeLocation]);

  // Menampilkan notifikasi saat ada error
  useEffect(() => {
    if (error) {
      addNotification('error', error);
      setError('');
    }
  }, [error]);

  // Menampilkan notifikasi saat ada pesan sukses
  useEffect(() => {
    if (success) {
      addNotification('success', success);
      setSuccess('');
    }
  }, [success]);

  // Menampilkan notifikasi saat ada pesan info
  useEffect(() => {
    if (info) {
      addNotification('info', info);
      setInfo('');
    }
  }, [info]);

  /**
   * Menambahkan notifikasi baru
   * @param type Tipe notifikasi: error, success, atau info
   * @param message Pesan notifikasi
   */
  const addNotification = (type: 'error' | 'success' | 'info', message: string) => {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    
    const id = Date.now().toString();
    setActiveNotification({ id, type, message });
    
    const timeout = setTimeout(() => {
      setActiveNotification(null);
    }, 3000);
    
    setNotificationTimeout(timeout);
  };

  /**
   * Menghapus notifikasi yang aktif
   */
  const removeNotification = () => {
    setActiveNotification(null);
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      setNotificationTimeout(null);
    }
  };

  /**
   * Mengambil data kehadiran pengguna dari API
   */
  const fetchAttendance = async () => {
    try {
      const data = await api.attendance.getUserAttendance();
      setAttendance(data);
      
      // Menampilkan pesan selamat datang jika belum absen hari ini
      if (!hasCheckedInToday()) {
        const timeNow = format(new Date(), 'HH:mm');
        setInfo(`Selamat datang, ${user?.full_name || ''}! Waktu saat ini: ${timeNow}`);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  /**
   * Memulai pelacakan lokasi pengguna
   */
  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation(position);
          setLocationError(null);
        },
        (error) => {
          setLocationError(error);
          let message = 'Error lokasi: ';
          
          switch(error.code) {
            case 1:
              message += 'Mohon izinkan akses lokasi pada browser Anda.';
              break;
            case 2:
              message += 'Lokasi tidak tersedia saat ini.';
              break;
            case 3:
              message += 'Waktu permintaan lokasi habis.';
              break;
            default:
              message += error.message;
          }
          
          setError(message);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000 
        }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation tidak didukung di browser ini');
    }
  };

  /**
   * Mengambil data lokasi kantor dari API
   */
  const fetchOfficeLocation = async () => {
    try {
      const data = await api.location.get();
      setOfficeLocation(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  /**
   * Menghitung jarak antara dua titik koordinat (dalam meter)
   */
  const calculateDistance = (point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number => {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = toRadians(point1.latitude);
    const φ2 = toRadians(point2.latitude);
    const Δφ = toRadians(point2.latitude - point1.latitude);
    const Δλ = toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Jarak dalam meter
  };

  /**
   * Mengkonversi derajat ke radian
   */
  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  /**
   * Memeriksa apakah pengguna berada dalam radius kantor
   */
  const isWithinOfficeRadius = (): boolean => {
    if (!currentLocation || officeLocation.lat === 0 || officeLocation.lng === 0 || !officeDistance) {
      return false;
    }
    
    return officeDistance <= officeLocation.radius;
  };

  /**
   * Menangani proses absensi masuk (check-in)
   */
  const handleCheckIn = async () => {
    if (!currentLocation) {
      setError('Lokasi tidak tersedia. Mohon aktifkan GPS dan izinkan akses lokasi.');
      return;
    }
    
    if (!isWithinOfficeRadius()) {
      setError('Anda berada di luar area kantor. Absensi hanya dapat dilakukan di dalam area kantor.');
      return;
    }
    
    setLoading(true);
    try {
      await api.attendance.checkIn(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      await fetchAttendance();
      setSuccess(`Absensi masuk berhasil pada ${format(new Date(), 'HH:mm')}. Selamat bekerja!`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Menangani proses absensi keluar (check-out)
   */
  const handleCheckOut = async () => {
    if (!currentLocation) {
      setError('Lokasi tidak tersedia. Mohon aktifkan GPS dan izinkan akses lokasi.');
      return;
    }
    
    if (!isWithinOfficeRadius()) {
      setError('Anda berada di luar area kantor. Absensi hanya dapat dilakukan di dalam area kantor.');
      return;
    }
    
    setLoading(true);
    try {
      await api.attendance.checkOut(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      await fetchAttendance();
      setSuccess(`Absensi keluar berhasil pada ${format(new Date(), 'HH:mm')}. Terima kasih atas kerja keras Anda hari ini!`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Memeriksa apakah pengguna sudah melakukan check-in hari ini
   */
  const hasCheckedInToday = (): boolean => {
    if (!attendance.length) return false;
    
    return attendance.some(record => {
      return record.check_in_time && isSameDay(parseISO(record.created_at), today);
    });
  };
  
  /**
   * Memeriksa apakah pengguna dapat melakukan check-in
   * (belum check-in hari ini atau telah menyelesaikan check-out)
   */
  const canCheckIn = (): boolean => {
    if (!attendance.length) return true;
    
    const todayAttendance = attendance.find(record => 
      isSameDay(parseISO(record.created_at), today)
    );
    
    if (todayAttendance) {
      return todayAttendance.check_out_time !== null;
    }
    
    return true;
  };
  
  /**
   * Memeriksa apakah pengguna dapat melakukan check-out
   * (sudah check-in hari ini tapi belum check-out)
   */
  const canCheckOut = (): boolean => {
    const todayAttendance = attendance.find(record => 
      isSameDay(parseISO(record.created_at), today)
    );
    
    return todayAttendance !== undefined && 
           todayAttendance.check_in_time !== null && 
           todayAttendance.check_out_time === null;
  };

  /**
   * Mendapatkan style notifikasi berdasarkan tipe
   */
  const getNotificationStyle = (type: 'error' | 'success' | 'info') => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-r from-red-900/90 to-red-800/90 border-red-500 text-red-100';
      case 'success':
        return 'bg-gradient-to-r from-green-900/90 to-green-800/90 border-green-500 text-green-100';
      case 'info':
        return 'bg-gradient-to-r from-blue-900/90 to-blue-800/90 border-blue-500 text-blue-100';
      default:
        return 'bg-gradient-to-r from-gray-900/90 to-gray-800/90 border-gray-500 text-gray-100';
    }
  };

  /**
   * Mendapatkan ikon notifikasi berdasarkan tipe
   */
  const getNotificationIcon = (type: 'error' | 'success' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-300" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-300" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-300" />;
      default:
        return <Info className="h-6 w-6 text-gray-300" />;
    }
  };

  return (
    <UserLayout>
      <div className="p-4 md:p-6 space-y-6 md:space-y-8 pb-6 relative max-w-7xl mx-auto">
        {/* Container notifikasi - tetap di tengah layar */}
        {activeNotification && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none bg-black/30 backdrop-blur-sm">
            <div className="max-w-md w-full px-4">
              <div 
                className={`${getNotificationStyle(activeNotification.type)} p-4 rounded-xl shadow-2xl flex items-start w-full pointer-events-auto transition-all duration-300 ease-in-out border border-opacity-30`}
                style={{
                  animation: 'fadeIn 0.3s forwards, fadeOut 0.3s 2.7s forwards'
                }}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(activeNotification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm md:text-base font-medium leading-5">{activeNotification.message}</p>
                </div>
                <button 
                  onClick={removeNotification} 
                  className={`ml-auto flex-shrink-0 hover:text-white focus:outline-none ${
                    activeNotification.type === 'error' ? 'text-red-300' : 
                    activeNotification.type === 'success' ? 'text-green-300' : 'text-blue-300'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Komponen utama: Peta lokasi */}
        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700 transform transition-all hover:shadow-lg">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 sm:px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="mr-2">📍</span> 
              Lokasi Anda Saat Ini
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {/* Komponen peta lokasi pengguna */}
            <LocationMap 
              currentLocation={currentLocation} 
              officeLocation={officeLocation}
            />
            <div className="mt-4">
              {/* Komponen status lokasi */}
              <LocationStatus
                currentLocation={currentLocation}
                isWithinOfficeRadius={isWithinOfficeRadius}
                locationError={locationError}
                officeDistance={officeDistance}
              />
            </div>
            <div className="mt-4">
              {/* Komponen tombol absensi */}
              <AttendanceButtons
                canCheckIn={canCheckIn()}
                canCheckOut={canCheckOut()}
                handleCheckIn={handleCheckIn}
                handleCheckOut={handleCheckOut}
                loading={loading}
                isWithinOfficeRadius={isWithinOfficeRadius}
                isWithinCheckInTime={() => true}
                isWithinCheckOutTime={() => true}
                currentLocation={currentLocation}
              />
            </div>
          </div>
        </div>

        {/* Komponen status absensi hari ini */}
        <div className="mt-6">
          <TodayStatus attendance={attendance} />
        </div>
        
        {/* Style untuk animasi notifikasi */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            
            @keyframes fadeOut {
              from {
                opacity: 1;
                transform: scale(1);
              }
              to {
                opacity: 0;
                transform: scale(0.95);
              }
            }
          `
        }} />
      </div>
    </UserLayout>
  );
}