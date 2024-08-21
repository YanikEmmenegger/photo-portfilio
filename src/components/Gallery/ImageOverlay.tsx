import {FC, useEffect, useState} from "react";
import {Photo} from "../../types/types.ts";
import {useUser} from "../../contexts/UserContext.tsx";
import LikeButton from "./LikeButton.tsx";
import toast from "react-hot-toast";
import {AiOutlineFullscreen} from "react-icons/ai";

interface ImageOverlayProps {
    photo: Photo;
    openLightbox: () => void;
}

const ImageOverlay: FC<ImageOverlayProps> = ({photo, openLightbox}) => {
    const {likedImageIDs, removeLikedImage, addLikedImage} = useUser();
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLiked(likedImageIDs.includes(photo.photo_id));
        setLoading(false);
    }, [likedImageIDs, photo.photo_id]);

    const handleLike = async () => {
        setLoading(true);
        if (isLiked) {
            if (await removeLikedImage(photo.photo_id)) {
                setIsLiked(false);
            } else {
                toast.error('Something went wrong');
            }
        } else {
            if (await addLikedImage(photo.photo_id)) {
                setIsLiked(true);
            } else {
                toast.error('Something went wrong');
            }
        }
        setLoading(false);
    };

    return (
        <div
            className="absolute flex flex-col justify-between inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

            <div className="p-5 grow cursor-pointer" onClick={openLightbox}>
                <h1 className="text-sm w-max font-bold">{photo.title}</h1>
                <h2 className="text-xs line-clamp-2 lg:line-clamp-4">{photo.description}</h2>
            </div>
            <div className="flex items-center justify-between px-5 pb-3 py-1">
                <div onClick={openLightbox} className="text-xs gap-2 flex-1 tr uncate">
                    {photo.keywords.join(', ')}
                </div>
                <LikeButton loading={loading} onclick={handleLike} isLiked={isLiked}/>
                <button onClick={openLightbox} className={"absolute right-8 md:hidden top-5  cursor-pointer items-center justify-center"}>
                    <AiOutlineFullscreen size={24}/>
                </button>
            </div>
        </div>
    );
};

export default ImageOverlay;
