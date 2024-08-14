import {FC, useState, useEffect} from "react";
import {Photo} from "../../types/types.ts";
import ImageOverlay from "./ImageOverlay.tsx";

interface PhotoProps {
    photo: Photo;
    isVisible: boolean;
}

const PhotoElement: FC<PhotoProps> = ({photo, isVisible}) => {
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const thumbnailUrl = `${BASE_URL}${photo.filename}-thumb${photo.extension}`;
    const originalUrl = `${BASE_URL}${photo.filename}${photo.extension}`;

    const [isLoading, setIsLoading] = useState(true);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            setImgSrc(originalUrl); // Load the high-res image when the element becomes visible
        }
    }, [isVisible, originalUrl]);

    return (
        <div className="relative overflow-hidden group">
            {/* Thumbnail Image */}
            <img
                src={thumbnailUrl}
                alt={photo.description}
                className={`w-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'} cursor-pointer`}
                style={{aspectRatio: `${photo.size.width} / ${photo.size.height}`}}
                onLoad={() => setIsLoading(false)}
            />
            {/* Original Image */}
            <img
                src={imgSrc || thumbnailUrl}
                alt={photo.description}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
            />
            {/* Overlay */}
            <ImageOverlay photo={photo}/>
        </div>
    );
};

export default PhotoElement;
