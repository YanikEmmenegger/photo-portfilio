import {FC, useState} from "react";
import {Photo} from "../../types/types.ts";
import ImageOverlay from "./ImageOverlay.tsx";
import Lightbox from "./Lightbox.tsx";

interface PhotoProps {
    photo: Photo;
}

const PhotoElement: FC<PhotoProps> = ({photo}) => {
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const thumbnailUrl = `${BASE_URL}${photo.filename}-thumb${photo.extension}`;
    const originalUrl = `${BASE_URL}${photo.filename}${photo.extension}`;
    const bigUrl = `${BASE_URL}${photo.filename}-big${photo.extension}`;

    const [isLoading, setIsLoading] = useState(true);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const isLandscape = photo.size.width > photo.size.height;

    const openLightbox = () => {
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    return (
        <div className="relative overflow-hidden group">
            {/* Thumbnail Image */}
            <img
                src={thumbnailUrl}
                alt={photo.description}
                className={`w-full h-[300px] object-cover transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'} cursor-pointer`}
                onClick={openLightbox} // Open lightbox on click
                onLoad={() => setIsLoading(false)}
            />
            {/* Original Image */}
            <img
                src={originalUrl}
                alt={photo.description}
                className={`absolute top-0 left-0 w-full h-[300px] object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
            />
            {/* Overlay */}
            <ImageOverlay
                photo={photo}
                onOpenLightbox={openLightbox} // Pass lightbox open handler to overlay
            />
            {/* Lightbox */}
            {isLightboxOpen && (
                <Lightbox isLandscape={isLandscape}  bigUrl={bigUrl} alt={photo.description} smallUrl={originalUrl} closeLightbox={closeLightbox}/>
            )}
        </div>
    );
};

export default PhotoElement;
