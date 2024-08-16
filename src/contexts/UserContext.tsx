import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../clients/supabaseClient'; // Ensure correct import path

// Define the context type
interface UserContextType {
    userId: string | null;
    likedImageIDs: number[];
    fetchLikedImages: () => void;
    addLikedImage: (photoId: number) => Promise<boolean>;
    removeLikedImage: (photoId: number) => Promise<boolean>;
}

// Create a context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [likedImageIDs, setLikedImageIDs] = useState<number[]>([]);

    // Fetch liked images from the database
    const fetchLikedImages = async () => {
        if (userId) {
            const {data: likes, error} = await supabase
                .from('likes')
                .select('photo_id')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching liked images:', error);
                return;
            }

            const imageIds = likes?.map(like => like.photo_id) || [];
            setLikedImageIDs(imageIds);
        }
    };

    // Add a liked image to the database
    const addLikedImage = async (photoId: number) => {
        if (userId) {
            const {error} = await supabase
                .from('likes')
                .insert([{user_id: userId, photo_id: photoId}]);

            if (error) {
                console.error('Error adding liked image:', error);
                return false;
            }

            setLikedImageIDs(prev => [...prev, photoId]);
            return true;
        }
        return false;
    };

    // Remove a liked image from the database
    const removeLikedImage = async (photoId: number) => {
        if (userId) {
            const {error} = await supabase
                .from('likes')
                .delete()
                .match({user_id: userId, photo_id: photoId});

            if (error) {
                console.error('Error removing liked image:', error);
                return false;
            }

            setLikedImageIDs(prev => prev.filter(id => id !== photoId));
            return true;
        }
        return false;
    };

    useEffect(() => {
        // Fetch current session
        const fetchSession = async () => {
            const {data: {session}, error} = await supabase.auth.getSession();
            if (error) {
                console.error('Error fetching session:', error);
                return;
            }

            if (!session?.user?.id) {
                const {data, error: signInError} = await supabase.auth.signInAnonymously();
                if (signInError) {
                    console.error('Error creating anonymous user:', signInError);
                    return;
                }
                setUserId(data?.user?.id || null);
            } else {
                setUserId(session.user.id);
            }
        };

        fetchSession();

        // Subscribe to authentication state changes
        const {data: authListener} = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                setUserId(session?.user?.id || null);
            } else if (event === 'SIGNED_OUT') {
                setUserId(null);
                setLikedImageIDs([]);
            }
        });

        // Cleanup subscription on component unmount
        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // Fetch liked images whenever userId changes
    useEffect(() => {
        if (userId) {
            fetchLikedImages();
        }
    }, [ userId]);

    return (
        <UserContext.Provider value={{userId, likedImageIDs, fetchLikedImages, addLikedImage, removeLikedImage}}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook for using the context
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
