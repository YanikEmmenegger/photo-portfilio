import {FC, useState, useRef, useEffect} from "react";
import PhotoElement from "./PhotoElement.tsx";
import Lightbox from "./Lightbox.tsx";
import {Photo} from "../../types/types.ts";
import {AiOutlineLoading} from "react-icons/ai";

interface PhotoGalleryProps {
    photos: Photo[];
    loading: boolean;
}

const PhotoGallery: FC<PhotoGalleryProps> = ({photos, loading}) => {
    const [visiblePhotos, setVisiblePhotos] = useState<{ [key: string]: boolean }>({});
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null); // Index of the photo for lightbox
    const observer = useRef<IntersectionObserver | null>(null);




    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const {target} = entry;
                        const filename = target.getAttribute('data-filename') || '';
                        setVisiblePhotos((prev) => ({...prev, [filename]: true}));
                        observer.current?.unobserve(target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '20px',
                threshold: 0.1,
            }
        );

        const elements = document.querySelectorAll('.photo-item');
        elements.forEach((element) => observer.current?.observe(element));

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [photos]);

    const openLightbox = (index: number) => {
        //if screen is small, do not open lightbox
        if (window.innerWidth < 640) return;
        setLightboxIndex(index)
    }

    return (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-2">
            {photos.map((photo, index) => (
                <div
                    key={photo.filename}
                    data-filename={photo.filename}
                    className="photo-item mb-2 opacity-0 transition-opacity duration-500"
                    style={{opacity: visiblePhotos[photo.filename] ? 1 : 0}}
                    //onClick={() => openLightbox(index)} // Open lightbox on click
                >
                    <PhotoElement openLightbox={()=>openLightbox(index)} photo={photo} isVisible={visiblePhotos[photo.filename]}/>
                </div>
            ))}
            {loading && (
                <div className="w-full text-center">
                    <AiOutlineLoading className="animate-spin"/>
                </div>
            )}
            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    photos={photos}
                    currentIndex={lightboxIndex}
                    closeLightbox={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
};

export default PhotoGallery;
