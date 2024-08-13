import {FC, useState, useRef, useEffect} from "react";
import PhotoElement from "./PhotoElement.tsx";
import {Photo} from "../../types/types.ts";
import {AiOutlineLoading} from "react-icons/ai";

interface PhotoGalleryProps {
    photos: Photo[];
    loading: boolean;
}

const PhotoGallery: FC<PhotoGalleryProps> = ({photos, loading}) => {
    const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
    const [page, setPage] = useState<number>(1);
    const photosPerPage = 30; // Number of photos per page
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // Update displayed photos when the page or photos change
        setDisplayedPhotos(photos.slice(0, page * photosPerPage));
    }, [photos, page]);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        const loadMoreHandler = ([entry]: IntersectionObserverEntry[]) => {
            if (entry.isIntersecting && !loading) {
                setPage(prev => prev + 1); // Load more photos
            }
        };

        observer.current = new IntersectionObserver(loadMoreHandler, {
            root: null,
            rootMargin: '20px',
            threshold: 1.0
        });

        const sentinel = document.getElementById('sentinel');
        if (sentinel) {
            observer.current.observe(sentinel);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [loading]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayedPhotos.map((photo) => (
                <PhotoElement key={photo.filename} photo={photo}/>
            ))}
            {loading && <div className="w-full text-center"><AiOutlineLoading/></div>}
            <div id="sentinel" className="h-1"></div>
        </div>
    );
};

export default PhotoGallery;
