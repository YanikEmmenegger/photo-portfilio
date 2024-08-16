import {FC, useEffect, useState} from "react";
import {Photo} from "../../types/types.ts";
import {useUser} from "../../contexts/UserContext.tsx";
import LikeButton from "./LikeButton.tsx";


interface ImageOverlayProps {
    photo: Photo;
    openLightbox: () => void;
}

const ImageOverlay: FC<ImageOverlayProps> = ({photo, openLightbox}) => {

    const {likedImageIDs, removeLikedImage, addLikedImage} = useUser();
    const [isLiked, setIsLiked] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setIsLiked(likedImageIDs.includes(photo.photo_id));
        setLoading(false);
    }, [likedImageIDs, photo.photo_id]);

    const handleLike = async () => {
        setLoading(true);
        // Add or remove the photo from the liked images

        if (isLiked) {
            await removeLikedImage(photo.photo_id)

        } else {
            await addLikedImage(photo.photo_id);
        }

    }


    return (
        <div
            className='absolute flex-col flex justify-between inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            <div className={"flex p-5 flex-col grow cursor-pointer"} onClick={openLightbox}>
                <span className='text-3xl text-center overflow-ellipsis w-max font-bold'>{photo.title}</span>
                <span className='text-xl'>{photo.description}</span>

            </div>
            <div className={"flex justify-between"}>
                <div onClick={openLightbox} className='flex pl-5 pb-5 cursor-pointer grow  gap-2'>
                    {photo.keywords.join(', ')}
                </div>
                <LikeButton loading={loading} onclick={() => handleLike()} isLiked={isLiked}/>
            </div>


        </div>
    );
}

export default ImageOverlay;