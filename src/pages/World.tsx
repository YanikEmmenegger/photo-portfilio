import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for missing Leaflet marker icons
const customIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const WorldMap = () => {
    return (
        <div className="h-screen w-screen">
            <MapContainer
                center={[51.505, -0.09]}
                zoom={3}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                {/* Dark Themed Tile Layer */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[51.505, -0.09]} icon={customIcon}>
                    <Popup>A dark-themed map.</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default WorldMap;
