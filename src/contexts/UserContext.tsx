import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../clients/supabaseClient';
import {
    addLikedImageToDb,
    fetchLikedImagesFromDb,
    fetchUserVote,
    fetchUnvotedMediaPair,
    removeLikedImageFromDB,
    submitVoteToDB,
} from "../utils/supabaseService.ts";
import {Media, Vote} from "../types/types.ts"; // Ensure correct import path

// Define the context type
interface UserContextType {
    userId: string | null;
    likedImageIDs: number[];
    votes: Vote[];
    votePair: { media1: Media, media2: Media } | null | false
    fetchLikedImages: () => void;
    submitVote: (selected_photo_id: number) => Promise<boolean>
    updateVotingPair: (winnerMediaID: number) => void;
    addLikedImage: (photoId: number) => Promise<boolean>;
    removeLikedImage: (photoId: number) => Promise<boolean>;
}

// Create a context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [likedImageIDs, setLikedImageIDs] = useState<number[]>([]);
    const [votePair, setVotePair] = useState<{ media1: Media, media2: Media } | null | false>(null);
    const [votes, setVotes] = useState<Vote[] | []>([])

    const fetchLikedImages = async () => {
        const imageIds = await fetchLikedImagesFromDb(userId);
        setLikedImageIDs(imageIds);
    };
    const fetchVotes = async () => {
        const votes = await fetchUserVote(userId!)
        setVotes(votes)
    }

    const setVotingPair = async () => {
        const mediaPair = await fetchUnvotedMediaPair(userId)

        if (mediaPair) {
            setVotePair({media1: mediaPair[0], media2: mediaPair[1]})
        } else {
            setVotePair(false)
        }
    }

    const submitVote = async (selected_photo_id: number) => {

        if (!userId || !votePair) {
            return false
        } else {

            const submittedVote = await submitVoteToDB(userId, votePair!.media1!.media_id!, votePair!.media2.media_id!, selected_photo_id)

            if (submittedVote && submittedVote.length !== 0) {
                await updateVotingPair(selected_photo_id)
                setVotes(prev => [...prev, submittedVote[0]]);
                return true
            } else {
                return false
            }
        }
    }

    const updateVotingPair = async (winnerMediaID: number) => {
        if (!votePair) return;

        const isWinnerMedia1 = votePair.media1.media_id === winnerMediaID;
        const position = isWinnerMedia1 ? 'media1' : 'media2';

        console.log("Winner was:", position);

        const newPair = await fetchUnvotedMediaPair(userId, winnerMediaID, position);

        if (newPair && newPair.length === 2) {
            const mediaA = newPair.find(m => m.media_id !== winnerMediaID);
            const mediaWinner = newPair.find(m => m.media_id === winnerMediaID);

            if (!mediaA || !mediaWinner) {
                setVotePair(false);
                return;
            }

            // Ensure winner stays in the same position
            setVotePair(
                position === 'media1'
                    ? {media1: mediaWinner, media2: mediaA}
                    : {media1: mediaA, media2: mediaWinner}
            );
        } else {
            setVotePair(false);
        }
    };

    // Add a liked image to the database
    const addLikedImage = async (photoId: number) => {
        if (await addLikedImageToDb(photoId, userId)) {
            setLikedImageIDs(prev => [...prev, photoId]);
            return true;
        } else {
            return false;
        }
    };

    // Remove a liked image from the database
    const removeLikedImage = async (photoId: number) => {
        if (await removeLikedImageFromDB(photoId, userId)) {
            setLikedImageIDs(prev => prev.filter(id => id !== photoId));
            return true;
        } else {
            return false;
        }
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
            fetchVotes()
            setVotingPair()
            fetchLikedImages();
        }
    }, [userId]);

    return (
        <UserContext.Provider value={{
            userId,
            likedImageIDs,
            fetchLikedImages,
            votePair,
            votes,
            addLikedImage,
            removeLikedImage,
            updateVotingPair, submitVote
        }}>
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
