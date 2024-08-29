import {FC, useEffect, useState, useRef, useCallback} from "react";
import {Photo} from "../../types/types.ts";
import {useUser} from "../../contexts/UserContext.tsx";
import LikeButton from "./LikeButton.tsx";
import toast from "react-hot-toast";
import {ClassNameValue, twMerge} from "tailwind-merge";

interface ImageOverlayProps {
    photo: Photo;
    openLightbox: () => void;
}

const ImageOverlay: FC<ImageOverlayProps> = ({photo, openLightbox}) => {
    const {likedImageIDs, removeLikedImage, addLikedImage} = useUser();
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [lineClamp, setLineClamp] = useState<ClassNameValue>('line-clamp-3'); // Default line-clamp to 2
    const descriptionRef = useRef<HTMLHeadingElement>(null);


    const calculateLineClamp = useCallback(() => {
        if (descriptionRef.current) {
            const element = descriptionRef.current;
            const availableHeight = element.offsetHeight;

            if (availableHeight > 60) {
                setLineClamp('line-clamp-2');
            }
            if (availableHeight > 120) {
                setLineClamp('line-clamp-4');
            }
            if (availableHeight > 180) {
                setLineClamp('line-clamp-11');
            }
        }
    }, []);

    useEffect(() => {
        setIsLiked(likedImageIDs.includes(photo.photo_id!));
        setLoading(false);
    }, [likedImageIDs, photo.photo_id]);

    useEffect(() => {
        calculateLineClamp();

        window.addEventListener("resize", calculateLineClamp);
        return () => {
            window.removeEventListener("resize", calculateLineClamp);
        };
    }, [calculateLineClamp]);

    const handleLike = async () => {
        setLoading(true);
        if (isLiked) {
            if (await removeLikedImage(photo.photo_id!)) {
                setIsLiked(false);
                photo.likes = photo.likes! - 1;
            } else {
                toast.error("Something went wrong");
            }
        } else {
            if (await addLikedImage(photo.photo_id!)) {
                setIsLiked(true);
                photo.likes = photo.likes! + 1;
            } else {
                toast.error("Something went wrong");
            }
        }
        setLoading(false);
    };

    return (
        <div
            className="absolute flex flex-col justify-between inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
            <div
                ref={descriptionRef}
                className="p-5 md:p-2 grow cursor-pointer"
                onClick={openLightbox}
            >
                <h1 className="text-sm w-max font-bold">{photo.title}</h1>
                <h2 className={twMerge("text-sm sm:text-xs", lineClamp)}>
                    {photo.description}
                </h2>
            </div>
            <div className="flex absolute items-center right-3 bottom-3">

                <LikeButton likes={photo.likes || 0} loading={loading} onclick={handleLike} isLiked={isLiked}/>
            </div>
        </div>
    );
};

export default ImageOverlay;
