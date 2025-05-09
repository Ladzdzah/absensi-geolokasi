import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair } from 'lucide-react';

// LocationMarker component with auto-centering
const LocationMarker: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  
  // Auto-center map when position changes
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return (
    <Marker
      position={position}
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
        <div className="text-gray-700">
          <h3 className="font-medium mb-1">Lokasi Anda</h3>
          <p className="text-sm">
            Latitude: {position[0].toFixed(6)} <br />
            Longitude: {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

interface LocationMapProps {
  currentLocation: GeolocationPosition | null;
}

const LocationMap: React.FC<LocationMapProps> = ({ currentLocation }) => {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="mt-4 h-[300px] rounded-lg overflow-hidden border border-gray-600 relative">
      {currentLocation ? (
        <MapContainer
          center={[currentLocation.coords.latitude, currentLocation.coords.longitude]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          // Disable all map interactions
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker 
            position={[
              currentLocation.coords.latitude,
              currentLocation.coords.longitude
            ]} 
          />
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
            <p>Mendeteksi lokasi...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;