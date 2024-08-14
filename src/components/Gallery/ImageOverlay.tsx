import {FC} from "react";
import {Photo} from "../../types/types.ts";


interface ImageOverlayProps {
    photo: Photo;
}

const ImageOverlay: FC<ImageOverlayProps> = ({photo, }) => {


    return (
        <div
             className='cursor-pointer absolute flex-col flex justify-between p-2 inset-0 bg-white bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>

            <span className='text-3xl text-center w-max font-bold'>{photo.description}</span>
            <div className='flex gap-2'>
                {photo.keywords.join(', ')}
            </div>

        </div>
    );
}

export default ImageOverlay;