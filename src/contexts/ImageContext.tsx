import React, {createContext, useState, useContext, ReactNode} from 'react';
import {Photo} from "../types/types.ts";



interface ImageContextProps {
    images: Photo[];
    currentImageIndex: number;
    setImages: React.Dispatch<React.SetStateAction<Photo[]>>;
    setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

const ImageContext = createContext<ImageContextProps | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [images, setImages] = useState<Photo[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    return (
        <ImageContext.Provider value={{images, currentImageIndex, setImages, setCurrentImageIndex}}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImageContext = () => {
    const context = useContext(ImageContext);
    if (context === undefined) {
        throw new Error('useImageContext must be used within an ImageProvider');
    }
    return context;
};