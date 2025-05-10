import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const officeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// LocationMarker component with auto-centering
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

// MapCenterer component to handle map centering
const MapCenterer: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  
  return null;
};

interface LocationMapProps {
  currentLocation: GeolocationPosition | null;
  officeLocation: {
    lat: number;
    lng: number;
    radius: number;
  };
}

const LocationMap: React.FC<LocationMapProps> = ({ currentLocation, officeLocation }) => {
  const userPosition: [number, number] | null = currentLocation 
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude] 
    : null;
  
  const officePosition: [number, number] = [officeLocation.lat, officeLocation.lng];
  const showOfficeLocation = officeLocation.lat !== 0 && officeLocation.lng !== 0;
  
  // Determine map center and zoom
  const mapCenter = userPosition || (showOfficeLocation ? officePosition : [0, 0]);
  const mapZoom = userPosition || showOfficeLocation ? 15 : 2;
  
  return (
    <div className="h-[300px] rounded-lg overflow-hidden border border-gray-600 mb-4">
      {userPosition || showOfficeLocation ? (
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Center the map on the user's location */}
          {userPosition && <MapCenterer position={userPosition} />}
          
          {/* Display user marker */}
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
          
          {/* Display office marker and radius */}
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
        <div className="flex items-center justify-center h-full bg-gray-700/50 text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
            <p>Mendeteksi lokasi...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;