import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Media } from "../../types/types";
import Photo from "./Photo";
import Video from "./Video";
import MediaInfoBox from "./MediaInfoBox.tsx";
import { twMerge } from "tailwind-merge";

interface GalleryProps {
    medias: Media[];
    loading: boolean;
    error: string | null;
}

const MasonryGallery: FC<GalleryProps> = ({ medias, loading, error }) => {
    const [columnsCount, setColumnsCount] = useState(1);
    const [columns, setColumns] = useState<Media[][]>([]);
    const [mediaInInfoBox, setMediaInInfoBox] = useState<Media | null>(null);
    const [isMobileAndOrTouch, setIsMobileAndOrTouch] = useState(false);

    // Determine if the user is on a mobile device or using touch input
    useEffect(() => {
        const updateIsMobileAndOrTouch = () => {
            setIsMobileAndOrTouch(
                window.matchMedia("(hover: none) and (pointer: coarse)").matches
            );
        };
        updateIsMobileAndOrTouch();
        window.addEventListener("resize", updateIsMobileAndOrTouch);
        return () => window.removeEventListener("resize", updateIsMobileAndOrTouch);
    }, []);

    // Disable page scrolling when the MediaInfoBox is open
    useEffect(() => {
        if (mediaInInfoBox) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mediaInInfoBox]);

    // Determine number of columns by screen width
    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 768) {
                setColumnsCount(1);
            } else if (window.innerWidth < 1024) {
                setColumnsCount(3);
            } else if (window.innerWidth < 1300) {
                setColumnsCount(4);
            } else {
                setColumnsCount(5);
            }
        };
        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    // Distribute items by “shortest column” approach
    useEffect(() => {
        const colData: { items: Media[]; totalHeight: number }[] = Array.from(
            { length: columnsCount },
            () => ({ items: [], totalHeight: 0 })
        );

        medias.forEach((media) => {
            const ratio = media.size?.height && media.size?.width
                ? media.size.height / media.size.width
                : 1;

            let smallestIndex = 0;
            for (let i = 1; i < colData.length; i++) {
                if (colData[i].totalHeight < colData[smallestIndex].totalHeight) {
                    smallestIndex = i;
                }
            }
            colData[smallestIndex].items.push(media);
            colData[smallestIndex].totalHeight += ratio;
        });

        setColumns(colData.map((c) => c.items));
    }, [medias, columnsCount]);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-16">
                <p className="text-lg font-semibold text-gray-500">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex items-center justify-center py-16">
                <p className="text-lg font-semibold text-red-500">{error}</p>
            </div>
        );
    }

    if (medias.length === 0) {
        return (
            <div className="w-full flex items-center justify-center py-16">
                <p className="text-lg font-semibold text-gray-500">No media found.</p>
            </div>
        );
    }

    return (
        <div className={twMerge("w-full flex gap-4", mediaInInfoBox && "overflow-hidden")}>
            {mediaInInfoBox && (
                <MediaInfoBox
                    media={mediaInInfoBox}
                    onClose={() => setMediaInInfoBox(null)}
                />
            )}

            {columns.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-4 flex-1">
                    {column.map((media) => (
                        <motion.div
                            key={media.media_id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            {media.extension === ".mp4" ? (
                                <Video
                                    onClick={() => !isMobileAndOrTouch && setMediaInInfoBox(media)}
                                    onInfoClick={() => setMediaInInfoBox(media)}
                                    video={media}
                                />
                            ) : (
                                <Photo
                                    onClick={() => !isMobileAndOrTouch && setMediaInInfoBox(media)}
                                    onInfoClick={() => setMediaInInfoBox(media)}
                                    photo={media}
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default MasonryGallery;
