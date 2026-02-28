import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { X, MapPin, Locate } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../../lib/api";
import { createProductIcon } from "../MapProductMarker";
import { useNavigate } from "react-router-dom";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const NearbyProductsModal = ({ isOpen, onClose }) => {
  const [userPos, setUserPos] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Get user location and load products
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserPos([lat, lng]);

          try {
            const res = await api.get(`/api/v1/products?page=${1}&limit=${400}`);
            const filtered = res?.data?.products?.filter(
              (p) => p.latitude !== null && p.longitude !== null
            );
            setProducts(filtered);
          } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to fetch products.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error(err);
          setError("Location permission denied or unavailable.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported on this device.");
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-green-500 rounded-2xl shadow-2xl w-11/12 max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Products Near You
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-200 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white">
              <Locate className="animate-spin mr-2 text-white" />
              Getting location and products...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <p className="text-red-500 font-medium mb-2">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          ) : (
            userPos && (
              <MapContainer
                center={userPos}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                <Marker position={userPos} icon={markerIcon}>
                  <Popup>You are here</Popup>
                </Marker>

                {products.map((p) => (
                  <Marker
                    key={p.id}
                    position={[Number(p.latitude), Number(p.longitude)]}
                    icon={createProductIcon(
                      `${import.meta.env.VITE_BASE_URL}${p.optimizedImages[0]}`,
                      p.name
                    )}
                    eventHandlers={{
                      click: () => {
                        onClose();
                        navigate(`/product-details/${p.id}`);
                      },
                    }}
                  />

                ))}
              </MapContainer>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyProductsModal;
