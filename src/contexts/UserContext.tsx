import React, {createContext, Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import {supabase} from '../clients/supabaseClient';
import {
    addLikedImageToDb,
    fetchLikedImagesFromDb,
    fetchUnvotedMediaPair,
    fetchUserVote,
    removeLikedImageFromDB,
    submitVoteToDB,
} from '../utils/supabaseService.ts';
import {Media, Vote} from '../types/types.ts';
import LoginPopup from '../components/Login/LoginPopup.tsx';
import NotificationPopup from "../components/Notifications/NotificationPopup.tsx";
import {isIOSDevice} from "../utils/isiPhoneiPad.ts";

interface UserContextType {
    userId: string | null;
    likedImageIDs: number[];
    votes: Vote[];
    votePair: { media1: Media; media2: Media } | null | false;
    fetchLikedImages: () => void;
    submitVote: (selected_photo_id: number) => Promise<boolean>;
    updateVotingPair: (winnerMediaID: number) => void;
    addLikedImage: (photoId: number) => Promise<boolean>;
    removeLikedImage: (photoId: number) => Promise<boolean>;
    openLoginModal: () => void;
    requireLogin: () => Promise<boolean>;
    logout: () => Promise<void>;
    authLoading: boolean; // NEW
    isSubscribed: boolean;
    setIsSubscribed: Dispatch<SetStateAction<boolean>>
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [likedImageIDs, setLikedImageIDs] = useState<number[]>([]);
    const [votePair, setVotePair] = useState<{ media1: Media; media2: Media } | null | false>(null);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authLoading, setAuthLoading] = useState(true); // NEW
    const [isSubscribed, setIsSubscribed] = useState(false)

    const [showNotificationPopup, setShowNotificationPopup] = useState(false);

    const openLoginModal = () => setShowLoginModal(true);
    const closeLoginModal = () => setShowLoginModal(false);

    const requireLogin = async (): Promise<boolean> => {
        if (authLoading) return false; // Wait until auth is resolved
        if (!userId) {
            openLoginModal();
            return false;
        }
        return true;
    };


    const logout = async () => {
        await supabase.auth.signOut();
        setUserId(null);
        setLikedImageIDs([]);
        setVotes([]);
        setVotePair(null);
    };

    const fetchLikedImages = async () => {
        if (!userId) return;
        const imageIds = await fetchLikedImagesFromDb(userId);
        setLikedImageIDs(imageIds);
    };

    const fetchVotes = async () => {
        if (!userId) return;
        const votes = await fetchUserVote(userId);
        setVotes(votes);
    };

    const setVotingPair = async () => {
        if (!userId) return;
        const mediaPair = await fetchUnvotedMediaPair(userId);
        if (mediaPair && mediaPair.length === 2) {
            setVotePair({ media1: mediaPair[0], media2: mediaPair[1] });
        } else {
            setVotePair(false);
        }
    };

    const submitVote = async (selected_photo_id: number) => {
        if (!userId || !votePair) {
            await requireLogin();
            return false;
        }

        const submittedVote = await submitVoteToDB(
            userId,
            votePair.media1.media_id!,
            votePair.media2.media_id!,
            selected_photo_id
        );

        if (submittedVote && submittedVote.length !== 0) {
            await updateVotingPair(selected_photo_id);
            setVotes((prev) => [...prev, submittedVote[0]]);
            return true;
        }

        return false;
    };

    const updateVotingPair = async (winnerMediaID: number) => {
        if (!votePair || !userId) return;

        const isWinnerMedia1 = votePair.media1.media_id === winnerMediaID;
        const position = isWinnerMedia1 ? 'media1' : 'media2';

        const newPair = await fetchUnvotedMediaPair(userId, winnerMediaID, position);

        if (newPair && newPair.length === 2) {
            const mediaA = newPair.find((m) => m.media_id !== winnerMediaID);
            const mediaWinner = newPair.find((m) => m.media_id === winnerMediaID);

            if (!mediaA || !mediaWinner) {
                setVotePair(false);
                return;
            }

            setVotePair(
                position === 'media1'
                    ? { media1: mediaWinner, media2: mediaA }
                    : { media1: mediaA, media2: mediaWinner }
            );
        } else {
            setVotePair(false);
        }
    };

    const addLikedImage = async (photoId: number) => {
        if (!userId) {
            await requireLogin();
            return false;
        }

        if (await addLikedImageToDb(photoId, userId)) {
            setLikedImageIDs((prev) => [...prev, photoId]);
            return true;
        }

        return false;
    };

    const removeLikedImage = async (photoId: number) => {
        if (!userId) {
            await requireLogin();
            return false;
        }

        if (await removeLikedImageFromDB(photoId, userId)) {
            setLikedImageIDs((prev) => prev.filter((id) => id !== photoId));
            return true;
        }

        return false;
    };

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error fetching session:', error);
            }
            setUserId(session?.user?.id ?? null);
            setAuthLoading(false); // ✅ Done loading

            if (session?.user?.id && !localStorage.getItem('notificationPromptShown') && !isIOSDevice()) {
                setShowNotificationPopup(true);
                localStorage.setItem('notificationPromptShown', 'true');
            }



        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null);
            if (!session?.user?.id) {


                setLikedImageIDs([]);
                setVotes([]);
                setVotePair(null);
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (userId) {
            fetchVotes();
            setVotingPair();
            fetchLikedImages();
        }
    }, [userId]);

    return (
        <UserContext.Provider
            value={{
                userId,
                likedImageIDs,
                fetchLikedImages,
                votePair,
                votes,
                addLikedImage,
                removeLikedImage,
                updateVotingPair,
                submitVote,
                openLoginModal,
                requireLogin,
                logout, isSubscribed, setIsSubscribed,
                authLoading // ✅ exposed here
            }}
        >
            {children}
            {showLoginModal && <LoginPopup onClose={closeLoginModal} />}
            {showNotificationPopup && (
                <NotificationPopup onClose={() => setShowNotificationPopup(false)}/>
            )}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
