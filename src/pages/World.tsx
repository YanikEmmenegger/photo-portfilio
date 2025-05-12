import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {useEffect, useState} from "react";
import {fetchPhotosWithFilter} from "../utils/supabaseService"; // Fetch function
import {Media} from "../types/types";
import MarkerClusterGroup from "react-leaflet-markercluster";
import {FiMinus, FiPlus} from "react-icons/fi";
import {RiResetLeftLine} from "react-icons/ri";

const WorldMap = () => {
    const [media, setMedia] = useState<Media[]>([]);
    const [map, setMap] = useState(null); // Store the map instance

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const mediaData = await fetchPhotosWithFilter({limit: 1000000});
                setMedia(mediaData || []);
            } catch (error) {
                console.error("Error fetching media:", error);
            }
        };

        fetchMedia();
    }, []);

    const createIcon = (imageUrl: string) => {
        return new L.Icon({
            iconUrl: imageUrl,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
        });
    };

    return (
        <>
            <ZoomControl map={map}/>

            <div className="flex flex-col flex-grow z-30 h-screen bg-gray-900">
                {/* External Zoom Controls (now independent of the map provider) */}
                // @ts-ignore
            <MapContainer
                center={[17.6,8]}
                zoomControl={false} fadeAnimation={true}
                zoom={3}
                scrollWheelZoom={true}
                attributionControl={false}
                dragging={true}
                minZoom={3}
                /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                // @ts-expect-error
                ref={(instance) => setMap(instance)}
                className="flex-grow h-0 w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                />

                <MarkerClusterGroup >
                    {media.map((item, index) =>
                        item.gpsInfos?.latitude && item.gpsInfos?.longitude ? (
                            <Marker
                                key={index}
                                position={[item.gpsInfos.latitude, item.gpsInfos.longitude]}
                                icon={createIcon(
                                    item.extension === ".mp4"
                                        ? `${import.meta.env.VITE_MEDIA_BASE_URL}${item.filename}.jpg`
                                        : `${import.meta.env.VITE_MEDIA_BASE_URL}${item.filename}${item.extension}`
                                )}
                            >
                                <Popup>
                                    <div>
                                        <h3 className="text-lg">{item.title || "Untitled"}</h3>
                                        {item.extension === ".mp4" ? (
                                            <video
                                                src={`${import.meta.env.VITE_MEDIA_BASE_URL}${item.filename}${item.extension}`}
                                                controls
                                                className="w-full"
                                            />
                                        ) : (
                                            <img
                                                src={`${import.meta.env.VITE_MEDIA_BASE_URL}${item.filename}-big${item.extension}`}
                                                alt={item.title}
                                                className="w-full"
                                            />
                                        )}
                                        {item.description && <p>{item.description}</p>}
                                    </div>
                                </Popup>
                            </Marker>
                        ) : null
                    )}
                </MarkerClusterGroup>
            </MapContainer>
            </div>
        </>
    );
};

// ✅ External Zoom Control now works outside the map provider
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const ZoomControl = ({map}) => {
    const handleZoomIn = () => {
        map.setZoom(map.getZoom() + 1);
    };
    const handleZoomOut = () => {
        map.setZoom(map.getZoom() - 1);
    }
    const handleResetZoom = () => {
        map.setZoom(3);
    }

    return (
        <div className="absolute bottom-5 right-5 flex flex-col gap-3 z-50 bg-neutral-900 p-3 rounded-lg shadow-lg">
            {/* Zoom In Button */}
            <button
                onClick={handleZoomIn}
                className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition duration-200 shadow-md"
                aria-label="Zoom In"
            >
                <FiPlus size={20}/>
            </button>

            {/* Zoom Out Button */}
            <button
                onClick={handleZoomOut}
                className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition duration-200 shadow-md"
                aria-label="Zoom Out"
            >
                <FiMinus size={20}/>
            </button>
            <button
                onClick={handleResetZoom}
                className={"p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition duration-200 shadow-md"}
                aria-label="Zoom Out"
            >
                <RiResetLeftLine size={20}/>
            </button>
        </div>
    );
};

export default WorldMap;
