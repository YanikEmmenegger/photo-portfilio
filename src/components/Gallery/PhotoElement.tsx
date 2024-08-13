import {FC, useState} from "react";
import {Photo} from "../../types/types.ts";

interface PhotoProps {
    photo: Photo;
}

const PhotoElement: FC<PhotoProps> = ({photo}) => {
    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const thumbnailUrl = `${BASE_URL}${photo.filename}-thumb${photo.extension}`;
    const originalUrl = `${BASE_URL}${photo.filename}${photo.extension}`;

    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={"relative flex-shrink-0 w-full md:w-[450px]"}>
            <img
                src={thumbnailUrl}
                alt={photo.description}
                className={`w-full h-full object-cover ${isLoading ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                //onLoad={() => setIsLoading(false)}
            />
            <img
                src={originalUrl}
                alt={photo.description}
                className={`absolute top-0 left-0 w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
};

export default PhotoElement;
