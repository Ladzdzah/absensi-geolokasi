import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface LocationMapProps {
  currentLocation: GeolocationPosition | null;
}

const LocationMap: React.FC<LocationMapProps> = ({ currentLocation }) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      const { latitude, longitude } = currentLocation.coords;

      // Fokuskan peta ke lokasi perangkat setiap kali lokasi diperbarui
      mapRef.current.setView([latitude, longitude], 16);
    }
  }, [currentLocation]); // Jalankan setiap kali currentLocation berubah

  return (
    <div className="h-[300px] rounded-lg overflow-hidden border border-gray-600">
      {currentLocation ? (
        <MapContainer
          center={[currentLocation.coords.latitude, currentLocation.coords.longitude]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          dragging={false} // Nonaktifkan geser manual
          touchZoom={false} // Nonaktifkan zoom dengan sentuhan
          doubleClickZoom={false} // Nonaktifkan zoom dengan klik ganda
          scrollWheelZoom={false} // Nonaktifkan zoom dengan scroll
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            position={[currentLocation.coords.latitude, currentLocation.coords.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div>
                <h3>Lokasi Anda</h3>
                <p>
                  Latitude: {currentLocation.coords.latitude.toFixed(6)} <br />
                  Longitude: {currentLocation.coords.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Lokasi tidak ditemukan.
        </div>
      )}
    </div>
  );
};

export default LocationMap;