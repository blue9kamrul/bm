import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { markerIcon } from './MarkerIcon';


const LocationPicker = ({ formData, setFormData }) => {

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setFormData({...formData, latitude: e.latlng.lat, longitude: e.latlng.lng})
      }
    });
    return null;
  };

  return (
    <MapContainer
      center={[formData.latitude, formData.longitude]}
      zoom={13}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker position={[formData.latitude, formData.longitude]} icon={markerIcon} />
      <MapClickHandler />
    </MapContainer>
  );
};

export default LocationPicker;
