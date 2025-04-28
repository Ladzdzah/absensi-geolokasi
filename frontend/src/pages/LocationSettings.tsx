import React, { useState, useEffect } from 'react';
import { MapPin, Save, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { OFFICE_LOCATION } from '../constants';
import AdminLayout from '../components/AdminLayout';
import type { OfficeLocation } from '../types';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationMarkerProps {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
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

export default function LocationSettings() {
  const [locationSettings, setLocationSettings] = useState<OfficeLocation>({
    lat: OFFICE_LOCATION.lat,
    lng: OFFICE_LOCATION.lng,
    radius: OFFICE_LOCATION.radius
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = () => {
    try {
      const savedLocation = localStorage.getItem('officeLocation');
      if (savedLocation) {
        setLocationSettings(JSON.parse(savedLocation));
      }
    } catch (err) {
      console.error('Error loading saved location:', err);
    }
  };

  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!locationSettings.lat || !locationSettings.lng || !locationSettings.radius) {
        throw new Error('Semua field harus diisi');
      }

      if (locationSettings.radius < 1) {
        throw new Error('Radius harus lebih besar dari 0 meter');
      }

      // Save to localStorage
      localStorage.setItem('officeLocation', JSON.stringify(locationSettings));
      setSuccess('Lokasi absensi berhasil diperbarui');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Pengaturan Lokasi Absen">
      <div className="space-y-6">
        {/* Info Panel */}
        <div className="bg-gray-800 rounded-xl shadow-md p-4 border border-gray-700">
          <div className="flex items-center space-x-2 text-gray-300">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">
              Klik pada peta atau geser penanda untuk menentukan lokasi. Atur radius area absensi menggunakan input di bawah.
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="p-6">
            <form onSubmit={handleLocationUpdate} className="space-y-6">
              {/* Coordinate Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={locationSettings.lat}
                    onChange={(e) => setLocationSettings({
                      ...locationSettings,
                      lat: parseFloat(e.target.value)
                    })}
                    className="block w-full rounded-lg bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={locationSettings.lng}
                    onChange={(e) => setLocationSettings({
                      ...locationSettings,
                      lng: parseFloat(e.target.value)
                    })}
                    className="block w-full rounded-lg bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Radius (meter)
                  </label>
                  <input
                    type="number"
                    value={locationSettings.radius}
                    onChange={(e) => setLocationSettings({
                      ...locationSettings,
                      radius: parseInt(e.target.value)
                    })}
                    className="block w-full rounded-lg bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Map Container */}
              <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-600">
                <MapContainer
                  center={[locationSettings.lat, locationSettings.lng]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker 
                    position={[locationSettings.lat, locationSettings.lng]}
                    setPosition={(pos: [number, number]) => {
                      setLocationSettings({
                        ...locationSettings,
                        lat: pos[0],
                        lng: pos[1]
                      });
                    }}
                  />
                  <Circle
                    center={[locationSettings.lat, locationSettings.lng]}
                    radius={locationSettings.radius}
                    pathOptions={{
                      color: '#7c3aed',
                      fillColor: '#7c3aed',
                      fillOpacity: 0.2,
                      weight: 2
                    }}
                  />
                </MapContainer>

                {/* Map Controls Overlay */}
                <div className="absolute bottom-4 right-4 bg-gray-800 rounded-lg shadow-md p-2 z-[1000] border border-gray-700">
                  <div className="text-xs text-gray-400">
                    Scroll untuk zoom • Seret penanda untuk memindahkan
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-900/50 border-l-4 border-red-700 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-900/50 border-l-4 border-green-700 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Save className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-300">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 