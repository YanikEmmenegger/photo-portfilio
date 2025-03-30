import { FC, useState } from "react";
import { Media } from "../../types/types.ts";
import { RiInfoI } from "react-icons/ri";

interface PhotoProps {
    photo: Media;
    onInfoClick?: () => void;
    onClick?: () => void;
}

const Photo: FC<PhotoProps> = ({ photo, onClick, onInfoClick }) => {
    const BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_MEDIA_BASE_URL
        : `${import.meta.env.VITE_MEDIA_BASE_URL}/`;

    // Three versions of the image:
    // - thumbnailUrl: low-quality blurred image (immediate)
    // - middleUrl: a better quality, smaller version (loaded second)
    // - originalUrl: high-quality image (loaded third)
    const thumbnailUrl = `${BASE_URL}${photo.filename}-thumb${photo.extension}`;
    const middleUrl = `${BASE_URL}${photo.filename}${photo.extension}`;
    const originalUrl = `${BASE_URL}${photo.filename}-big${photo.extension}`;

    const [middleLoaded, setMiddleLoaded] = useState(false);
    const [bigLoaded, setBigLoaded] = useState(false);

    return (
        <div
            className="relative overflow-hidden group cursor-pointer"
            style={{ aspectRatio: `${photo.size?.width} / ${photo.size?.height}` }}
            onClick={onClick}
        >
            {/* Base Layer: Blurred Thumbnail */}
            <img
                src={thumbnailUrl}
                alt={photo.title}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 
          ${middleLoaded ? "opacity-0" : "opacity-100"}`}
            />
            {/* Middle Quality Image */}
            <img
                src={middleUrl}
                alt={photo.title}
                onLoad={() => setMiddleLoaded(true)}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 
          ${middleLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {/* Full Quality Image (loaded after middle image) */}
            {middleLoaded && (
                <img
                    src={originalUrl}
                    alt={photo.title}
                    onLoad={() => setBigLoaded(true)}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 
            ${bigLoaded ? "opacity-100" : "opacity-0"}`}
                />
            )}
            {/* Info Button */}
            <div className="absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 flex items-center gap-2 z-10">
                <button
                    onClick={onInfoClick}
                    className="bg-black/50 text-white p-2 rounded-full"
                >
                    <RiInfoI />
                </button>
            </div>
        </div>
    );
};

export default Photo;
