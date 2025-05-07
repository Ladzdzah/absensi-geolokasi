import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { LocationSettingsForm } from '../components/admin/location/LocationSettingsForm';

export default function LocationSettings() {
  const [locationSettings, setLocationSettings] = useState({
    latitude: 0,
    longitude: 0,
    radius: 100
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      setLocationSettings({
        latitude: data.lat || 0,
        longitude: data.lng || 0,
        radius: data.radius || 100,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOfficeLocation();
  }, []);

  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/office-location', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify({
          lat: locationSettings.latitude,
          lng: locationSettings.longitude,
          radius: locationSettings.radius
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui lokasi kantor');
      }

      const data = await response.json();
      setSuccess(data.message || 'Lokasi kantor berhasil diperbarui');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Pengaturan Lokasi Absen">
      <LocationSettingsForm
        locationSettings={locationSettings}
        setLocationSettings={setLocationSettings}
        handleLocationUpdate={handleLocationUpdate}
        error={error}
        success={success}
        loading={loading}
      />
    </AdminLayout>
  );
}