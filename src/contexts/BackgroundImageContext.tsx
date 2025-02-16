import React, {createContext, useState, useContext, ReactNode} from 'react';
import {Media} from "../types/types.ts";



interface BackgroundImageContextProps {
    images: Media[];
    currentImageIndex: number;
    setImages: React.Dispatch<React.SetStateAction<Media[]>>;
    setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

const BackgroundImageContext = createContext<BackgroundImageContextProps | undefined>(undefined);

export const BackgroundImageProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [images, setImages] = useState<Media[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    return (
        <BackgroundImageContext.Provider value={{images, currentImageIndex, setImages, setCurrentImageIndex}}>
            {children}
        </BackgroundImageContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useImageContext = () => {
    const context = useContext(BackgroundImageContext);
    if (context === undefined) {
        throw new Error('useImageContext must be used within an ImageProvider');
    }
    return context;
};
