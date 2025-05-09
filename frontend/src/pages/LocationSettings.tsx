import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { LocationSettingsForm } from '../components/admin/location/LocationSettingsForm';
import { api } from '../services/api';

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
      const data = await api.location.get();
      setLocationSettings({
        latitude: data.lat,
        longitude: data.lng,
        radius: data.radius
      });
    } catch (error: any) {
      setError(error.message);
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
      await api.location.update(
        locationSettings.latitude,
        locationSettings.longitude,
        locationSettings.radius
      );
      setSuccess('Lokasi kantor berhasil diperbarui');
    } catch (error: any) {
      setError(error.message);
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