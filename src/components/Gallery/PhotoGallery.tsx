import {FC, useState, useRef, useEffect} from "react";
import PhotoElement from "./PhotoElement";
import Lightbox from "./Lightbox";
import {Photo} from "../../types/types";

interface PhotoGalleryProps {
    photos: Photo[];
}

const PhotoGallery: FC<PhotoGalleryProps> = ({photos}) => {
    const [visiblePhotos, setVisiblePhotos] = useState<{ [key: string]: boolean }>({});
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const filename = entry.target.getAttribute('data-filename') || '';
                        setVisiblePhotos((prev) => ({...prev, [filename]: true}));
                        observer.current?.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '20px',
                threshold: 0.1,
            }
        );

        const elements = Array.from(document.querySelectorAll('.photo-item'));
        elements.forEach((element) => observer.current?.observe(element));

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [photos]);

    const openLightbox = (index: number) => {
        if (window.innerWidth >= 0) {
            setLightboxIndex(index);
        }
    };

    return (
        <div className="grid gap-1 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo, index) => (
                <div
                    key={index}
                    data-filename={photo.filename}
                    className="photo-item bg-teal-900 opacity-0 transition-opacity duration-500"
                    style={{
                        opacity: visiblePhotos[photo.filename] ? 1 : 0,
                        gridRowEnd: `span ${Math.ceil(photo.size.height / photo.size.width * 10)}`,
                        aspectRatio: `${photo.size.width} / ${photo.size.height}`,
                    }}>
                    <PhotoElement
                        photo={photo}
                        isVisible={visiblePhotos[photo.filename] || false}
                        openLightbox={() => openLightbox(index)}
                    /></div>
            ))}
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
