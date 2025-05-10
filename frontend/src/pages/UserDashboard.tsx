import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Attendance } from '../types';
import UserLayout from '../components/user/UserLayout';
import LocationMap from '../components/user/LocationMap';
import LocationStatus from '../components/user/LocationStatus';
import AttendanceButtons from '../components/user/AttendanceButtons';
import TodayStatus from '../components/user/TodayStatus';
import { api } from '../services/api';

export default function UserDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [officeLocation, setOfficeLocation] = useState({
    lat: 0,
    lng: 0,
    radius: 100
  });

  useEffect(() => {
    fetchAttendance();
    getCurrentLocation();
    fetchOfficeLocation();
  }, []);

  const fetchAttendance = async () => {
    try {
      const data = await api.attendance.getUserAttendance();
      setAttendance(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation(position),
        (error) => setError('Error: ' + error.message)
      );
    } else {
      setError('Geolocation tidak didukung di browser ini');
    }
  };

  const fetchOfficeLocation = async () => {
    try {
      const data = await api.location.get();
      setOfficeLocation(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation) return;
    setLoading(true);
    try {
      await api.attendance.checkIn(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      await fetchAttendance();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) return;
    setLoading(true);
    try {
      await api.attendance.checkOut(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      await fetchAttendance();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const canCheckIn = !attendance.length || attendance[0].check_out_time !== null;
  const canCheckOut = attendance.length > 0 && attendance[0].check_in_time && !attendance[0].check_out_time;

  return (
    <UserLayout>
      <div className="space-y-8">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Lokasi Anda Saat Ini</h2>
          </div>
          <div className="p-6">
            <LocationMap 
              currentLocation={currentLocation} 
              officeLocation={officeLocation}
            />
            <LocationStatus
              currentLocation={currentLocation}
              isWithinOfficeRadius={() => true} // Replace with actual logic
            />
            <AttendanceButtons
              canCheckIn={!!canCheckIn}
              canCheckOut={!!canCheckOut}
              handleCheckIn={handleCheckIn}
              handleCheckOut={handleCheckOut}
              loading={loading}
              isWithinOfficeRadius={() => !!currentLocation} // Function returning boolean
              isWithinCheckInTime={() => true} // Function returning boolean
              isWithinCheckOutTime={() => true} // Function returning boolean
              currentLocation={currentLocation}
            />
          </div>
        </div>

        <TodayStatus attendance={attendance} />
      </div>
    </UserLayout>
  );
}