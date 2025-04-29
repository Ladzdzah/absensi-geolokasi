import React, { useState, useEffect } from 'react';
import { MapPin, Save } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AdminLayout from '../components/AdminLayout';

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

export default function LocationSettings() {
  const [locationSettings, setLocationSettings] = useState({ lat: 0, lng: 0, radius: 100 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDeviceLocation(); // Dapatkan lokasi perangkat saat halaman dimuat
    fetchOfficeLocation();
  }, []);

  const getDeviceLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationSettings((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
          }));
        },
        (error) => {
          setError('Gagal mendapatkan lokasi perangkat: ' + error.message);
        }
      );
    } else {
      setError('Geolocation tidak didukung oleh browser Anda');
    }
  };

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
        lat: data.lat ?? 0,
        lng: data.lng ?? 0,
        radius: data.radius > 0 ? data.radius : 100,
      });
    } catch (err: any) {
      setError(err.message);
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
      setError('Nilai Latitude harus antara -90 hingga 90, Longitude harus antara -180 hingga 180, dan Radius harus lebih besar dari 0.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/office-location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify(locationSettings),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui lokasi kantor');
      }

      setSuccess('Lokasi kantor berhasil diperbarui');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Pengaturan Lokasi Absen">
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl shadow-md p-4 border border-gray-700">
          <div className="flex items-center space-x-2 text-gray-300">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">Klik pada peta atau geser penanda untuk menentukan lokasi.</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
          <div className="p-6">
            <form onSubmit={handleLocationUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={locationSettings.lat || ''}
                    onChange={(e) => setLocationSettings({ ...locationSettings, lat: parseFloat(e.target.value) || 0 })}
                    className="block w-full rounded-lg bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={locationSettings.lng || ''}
                    onChange={(e) => setLocationSettings({ ...locationSettings, lng: parseFloat(e.target.value) || 0 })}
                    className="block w-full rounded-lg bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Radius (meter)</label>
                  <input
                    type="number"
                    value={locationSettings.radius || ''}
                    onChange={(e) => setLocationSettings({ ...locationSettings, radius: parseInt(e.target.value) || 1 })}
                    className="block w-full rounded-lg bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-600">
                {locationSettings.lat !== 0 && locationSettings.lng !== 0 ? (
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
                      setPosition={(pos: [number, number]) => setLocationSettings({ ...locationSettings, lat: pos[0], lng: pos[1] })}
                    />
                    <MapUpdater center={[locationSettings.lat, locationSettings.lng]} />
                    <Circle
                      center={[locationSettings.lat, locationSettings.lng]}
                      radius={locationSettings.radius > 0 ? locationSettings.radius : 100} // Gunakan default radius jika radius <= 0
                      pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.2, weight: 2 }}
                    />
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Lokasi tidak valid. Menunggu lokasi perangkat...
                  </div>
                )}
              </div>

              <div className="mt-6">
                <table className="table-auto w-full text-left text-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b border-gray-600">Parameter</th>
                      <th className="px-4 py-2 border-b border-gray-600">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b border-gray-600">Latitude</td>
                      <td className="px-4 py-2 border-b border-gray-600">
                        {locationSettings.lat !== 0 ? locationSettings.lat : 'Belum diatur'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b border-gray-600">Longitude</td>
                      <td className="px-4 py-2 border-b border-gray-600">
                        {locationSettings.lng !== 0 ? locationSettings.lng : 'Belum diatur'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {error && <div className="bg-red-900/50 border-l-4 border-red-700 p-4 rounded">{error}</div>}
              {success && <div className="bg-green-900/50 border-l-4 border-green-700 p-4 rounded">{success}</div>}

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