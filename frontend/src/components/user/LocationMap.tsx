import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

/**
 * Memperbaiki masalah ikon default Leaflet
 */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

/**
 * Ikon untuk marker pengguna (biru)
 */
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Ikon untuk marker kantor (merah)
 */
const officeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Komponen untuk menampilkan marker pada peta dengan popup informasi
 */
const LocationMarker: React.FC<{ 
  position: [number, number]; 
  icon: L.Icon;
  popupContent?: React.ReactNode;
}> = ({ position, icon, popupContent }) => {
  return (
    <Marker position={position} icon={icon}>
      {popupContent && <Popup>{popupContent}</Popup>}
    </Marker>
  );
};

/**
 * Komponen untuk mengatur pusat peta secara otomatis
 */
const MapCenterer: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  
  return null;
};

/**
 * Interface untuk properti komponen peta lokasi
 */
interface LocationMapProps {
  currentLocation: GeolocationPosition | null;  // Lokasi pengguna saat ini
  officeLocation: {                             // Lokasi dan radius kantor
    lat: number;
    lng: number;
    radius: number;
  };
}

/**
 * Komponen panduan untuk mengaktifkan lokasi
 */
const LocationGuide: React.FC = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="flex items-center justify-center h-full bg-gray-800/80 text-gray-300 p-4">
      <div className="text-center max-w-sm">
        <MapPin className="w-8 h-8 mx-auto mb-3 text-blue-400" />
        <h3 className="text-lg font-medium mb-2">Aktifkan Lokasi</h3>
        {isMobile ? (
          <div className="text-sm space-y-2">
            <p>Untuk mengaktifkan lokasi di perangkat mobile:</p>
            <ol className="text-left space-y-1 text-gray-400">
              <li>1. Buka Pengaturan perangkat Anda</li>
              <li>2. Cari menu Privasi atau Lokasi</li>
              <li>3. Pastikan Lokasi diaktifkan</li>
              <li>4. Izinkan browser mengakses lokasi</li>
              <li>5. Refresh halaman ini</li>
            </ol>
          </div>
        ) : (
          <div className="text-sm space-y-2">
            <p>Untuk mengaktifkan lokasi di browser:</p>
            <ol className="text-left space-y-1 text-gray-400">
              <li>1. Klik ikon kunci/info di address bar</li>
              <li>2. Cari pengaturan Lokasi</li>
              <li>3. Pilih "Izinkan" atau "Allow"</li>
              <li>4. Refresh halaman ini</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Komponen untuk menampilkan peta dengan lokasi pengguna dan kantor
 * beserta radius area kantor
 */
const LocationMap: React.FC<LocationMapProps> = ({ currentLocation, officeLocation }) => {
  // Mengubah data lokasi pengguna ke format yang dibutuhkan Leaflet
  const userPosition: [number, number] | null = currentLocation 
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude] 
    : null;
  
  // Mengubah data lokasi kantor ke format yang dibutuhkan Leaflet
  const officePosition: [number, number] = [officeLocation.lat, officeLocation.lng];
  const showOfficeLocation = officeLocation.lat !== 0 && officeLocation.lng !== 0;
  
  // Menentukan pusat dan zoom peta
  const mapCenter = userPosition || (showOfficeLocation ? officePosition : [0, 0]);
  const mapZoom = userPosition || showOfficeLocation ? 15 : 2;
  
  return (
    <div className="h-[250px] sm:h-[300px] rounded-xl overflow-hidden mb-4 touch-manipulation border-0 sm:border border-gray-600 shadow-lg sm:shadow-none bg-white/10 backdrop-blur-md relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-tr before:from-blue-500/30 before:via-indigo-500/20 before:to-purple-500/30 before:z-0 sm:before:hidden">
      {userPosition || showOfficeLocation ? (
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}
          scrollWheelZoom={false}
          zoomControl={true}
          dragging={true}
        >
          {/* Layer peta dasar dari OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Pusatkan peta pada lokasi pengguna */}
          {userPosition && <MapCenterer position={userPosition} />}
          
          {/* Tampilkan marker pengguna */}
          {userPosition && (
            <LocationMarker 
              position={userPosition} 
              icon={userIcon}
              popupContent={
                <div className="text-gray-700">
                  <h3 className="font-medium mb-1">Lokasi Anda</h3>
                  <p className="text-sm">
                    Latitude: {userPosition[0].toFixed(6)} <br />
                    Longitude: {userPosition[1].toFixed(6)}
                  </p>
                </div>
              }
            />
          )}
          
          {/* Tampilkan marker kantor dan radius */}
          {showOfficeLocation && (
            <>
              <LocationMarker 
                position={officePosition} 
                icon={officeIcon}
                popupContent={
                  <div className="text-gray-700">
                    <h3 className="font-medium mb-1">Lokasi Kantor</h3>
                    <p className="text-sm">
                      Radius: {officeLocation.radius} meter
                    </p>
                  </div>
                }
              />
              <Circle 
                center={officePosition}
                radius={officeLocation.radius}
                pathOptions={{ 
                  color: '#4F46E5',
                  fillColor: '#4F46E5',
                  fillOpacity: 0.15
                }}
              />
            </>
          )}
        </MapContainer>
      ) : (
        <LocationGuide />
      )}
    </div>
  );
};

export default LocationMap;