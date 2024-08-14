import React, {createContext, useContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';

// Define the context type
interface UserContextType {
    userId: string;
    likedImageIDs: number[];
    fetchLikedImages: () => void;
    addLikedImage: (photoId: number) => Promise<boolean>;
    removeLikedImage: (photoId: number) => Promise<boolean>;
}

// Create a context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper functions for local storage
const getStoredLikedImages = (userId: string): number[] => {
    const stored = localStorage.getItem(`likedImages_${userId}`);
    return stored ? JSON.parse(stored) : [];
};

const saveLikedImages = (userId: string, likedImages: number[]) => {
    localStorage.setItem(`likedImages_${userId}`, JSON.stringify(likedImages));
};

// Create a provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [userId, setUserId] = useState<string>('');
    const [likedImageIDs, setLikedImageIDs] = useState<number[]>([]);

    const fetchLikedImages = () => {
        console.log('fetching liked images');
        if (userId) {
            const images = getStoredLikedImages(userId);
            setLikedImageIDs(images);
        }
    };

    const addLikedImage = async (photoId: number) => {
        setTimeout(() => {
            if (userId) {
                const updatedLikedImages = [...likedImageIDs, photoId];
                setLikedImageIDs(updatedLikedImages);
                saveLikedImages(userId, updatedLikedImages);
                return true;
            }
            return false;
        }, 500);
        return false;
    };

    const removeLikedImage = async (photoId: number) => {
        setTimeout(() => {
            if (userId) {
                const updatedLikedImages = likedImageIDs.filter(id => id !== photoId);
                setLikedImageIDs(updatedLikedImages);
                saveLikedImages(userId, updatedLikedImages);
                return true;
            }
            return false;
        }, 500);
        return false;
    };

    useEffect(() => {
        // Try to get the userId from local storage
        let storedUserId = localStorage.getItem('userId');

        if (!storedUserId || storedUserId === 'undefined' || storedUserId === '') {
            // If not found, generate a new UUID
            storedUserId = uuidv4();
            localStorage.setItem('userId', storedUserId);
        }

        setUserId(storedUserId);

        // Fetch liked images on load
        fetchLikedImages();
    }, [userId]);

    return (
        <UserContext.Provider value={{userId, likedImageIDs, fetchLikedImages, addLikedImage, removeLikedImage}}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook for using the context
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
