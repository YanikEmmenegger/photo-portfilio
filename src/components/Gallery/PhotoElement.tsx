import {FC, useState} from "react";
import {Photo} from "../../types/types.ts";
import ImageOverlay from "./ImageOverlay.tsx";

interface PhotoProps {
    photo: Photo;
    openLightbox: () => void;
}

const PhotoElement: FC<PhotoProps> = ({photo, openLightbox}) => {

    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const thumbnailUrl = `${BASE_URL}${photo.filename}-thumb${photo.extension}`;
    const originalUrl = `${BASE_URL}${photo.filename}${photo.extension}`;

    const [isLoading, setIsLoading] = useState(true);

    return (
        <div
            className="relative overflow-hidden group cursor-pointer"
            style={{aspectRatio: `${photo.size?.width} / ${photo.size?.height}`}}
            //onClick={openLightbox}
        >
            <img
                src={isLoading ? thumbnailUrl : originalUrl}
                alt={photo.description}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500`}
                onLoad={() => setIsLoading(false)}
                //loading="lazy"
                //style={{visibility: imgSrc ? 'visible' : 'hidden'}}
            />
            {/* Overlay */}
            <ImageOverlay openLightbox={openLightbox} photo={photo}/>
        </div>
    );
};

export default PhotoElement;
