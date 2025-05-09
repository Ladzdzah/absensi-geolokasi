import React, { useState, useEffect } from 'react';
import { MapPin, Save, Check, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
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

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LocationSettingsFormProps {
  locationSettings: { latitude: number; longitude: number; radius: number };
  setLocationSettings: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number; radius: number }>>;
  handleLocationUpdate: (e: React.FormEvent) => void;
  error: string;
  success: string;
  loading: boolean;
}

export const LocationSettingsForm: React.FC<LocationSettingsFormProps> = ({
  locationSettings,
  setLocationSettings,
  handleLocationUpdate,
  error,
  success,
  loading,
}) => {
  // Keep track of the original location settings to check if changes were made
  const [originalSettings] = useState({
    latitude: locationSettings.latitude,
    longitude: locationSettings.longitude,
    radius: locationSettings.radius
  });
  const [noChangesMessage, setNoChangesMessage] = useState('');

  // Check if location settings have been changed
  const hasLocationChanged = () => {
    return (
      originalSettings.latitude !== locationSettings.latitude ||
      originalSettings.longitude !== locationSettings.longitude ||
      originalSettings.radius !== locationSettings.radius
    );
  };

  // Handle form submission with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any changes were made
    if (!hasLocationChanged()) {
      setNoChangesMessage('Lokasi kantor belum diubah. Silakan ubah lokasi terlebih dahulu.');
      return;
    }
    
    // Clear any previous message
    setNoChangesMessage('');
    
    // Proceed with the provided update handler
    handleLocationUpdate(e);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl shadow-md p-4 border border-gray-700">
        <div className="flex items-center space-x-2 text-gray-300">
          <MapPin className="w-5 h-5" />
          <span className="text-sm">Klik pada peta atau geser penanda untuk menentukan lokasi.</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={locationSettings.latitude || ''}
                    onChange={(e) => setLocationSettings({ ...locationSettings, latitude: parseFloat(e.target.value) || 0 })}
                    className="block w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Masukkan latitude..."
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">°N/S</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">Rentang: -90° hingga 90°</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={locationSettings.longitude || ''}
                    onChange={(e) => setLocationSettings({ ...locationSettings, longitude: parseFloat(e.target.value) || 0 })}
                    className="block w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Masukkan longitude..."
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">°E/W</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">Rentang: -180° hingga 180°</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Radius
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={locationSettings.radius || ''}
                    onChange={(e) => setLocationSettings({ ...locationSettings, radius: parseInt(e.target.value) || 1 })}
                    className="block w-full pl-4 pr-16 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Masukkan radius..."
                    min="1"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">meter</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">Minimal: 1 meter</p>
              </div>
            </div>

            <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-600">
              {locationSettings.latitude !== 0 && locationSettings.longitude !== 0 ? (
                <MapContainer
                  center={[locationSettings.latitude, locationSettings.longitude]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker
                    position={[locationSettings.latitude, locationSettings.longitude]}
                    setPosition={(pos: [number, number]) => setLocationSettings({ ...locationSettings, latitude: pos[0], longitude: pos[1] })}
                  />
                  <MapUpdater center={[locationSettings.latitude, locationSettings.longitude]} />
                  <Circle
                    center={[locationSettings.latitude, locationSettings.longitude]}
                    radius={locationSettings.radius > 0 ? locationSettings.radius : 100}
                    pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.2, weight: 2 }}
                  />
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Lokasi tidak valid. Menunggu lokasi perangkat...
                </div>
              )}
            </div>

            <div className="space-y-4">
              {error && (
                <div className="animate-fade-in bg-red-900/30 border border-red-900/50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-300">Terjadi Kesalahan</h3>
                      <div className="mt-1 text-sm text-red-200">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="animate-fade-in bg-green-900/30 border border-green-900/50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-300">Berhasil Disimpan</h3>
                      <div className="mt-1 text-sm text-green-200">
                        {success}
                      </div>
                      <div className="mt-2 text-sm text-green-300">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Latitude: {typeof locationSettings.latitude === 'number' ? locationSettings.latitude.toFixed(6) : '0.000000'}°</li>
                          <li>Longitude: {typeof locationSettings.longitude === 'number' ? locationSettings.longitude.toFixed(6) : '0.000000'}°</li>
                          <li>Radius: {locationSettings.radius} meter</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
  );
};