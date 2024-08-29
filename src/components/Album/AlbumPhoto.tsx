import {FC} from "react";
import {Photo} from "../../types/types.ts";
import {twMerge} from "tailwind-merge";

interface AlbumGalleryProps {
    photo: Photo;
    index: number;
}

const AlbumPhoto: FC<AlbumGalleryProps> = ({photo, index}) => {

    const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL.endsWith('/')
        ? import.meta.env.VITE_IMAGE_BASE_URL
        : `${import.meta.env.VITE_IMAGE_BASE_URL}/`;

    const url = `${BASE_URL}${photo.filename}-big${photo.extension}`;

    return (
        <div
            className={twMerge("w-full my-40 flex flex-col md:flex-row items-start", index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse")}>
            <div className="flex-1 flex flex-col justify-center px-5 md:py-0 py-5">
                <h2 className="text-3xl font-bold mb-2">{photo.title}</h2>
                <p className="text-2xl">{photo.description}</p>
                {photo.keywords?.join(', ')}
            </div>
            <div className="flex-1 max-w-full">
                <img
                    className="w-full h-auto object-contain max-h-[80vh]"
                    src={url}
                    alt={photo.title}
                />
            </div>
        </div>
    );
};

export default AlbumPhoto;
