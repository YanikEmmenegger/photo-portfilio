import {FC} from "react";
import PhotoElement from "./PhotoElement.tsx";
import {Photo} from "../../types/types.ts";

interface PhotoGalleryProps {
    photos: Photo[];
    loading: boolean;
}

const PhotoGallery: FC<PhotoGalleryProps> = ({photos, loading}) => {
    return (
        <div className="flex bg-amber-400 flex-wrap justify-center">
            {photos.map((photo) => (
                <PhotoElement key={photo.filename} photo={photo}/>
            ))}
            {loading && <div className="w-full text-center">Loading...</div>}
        </div>
    );
};

export default PhotoGallery;
