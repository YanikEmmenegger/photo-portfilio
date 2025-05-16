import {useEffect, useState} from "react";
import {useNotificationRegistration} from "../../utils/useNotifications";
import {useUser} from "../../contexts/UserContext";
import {AnimatePresence, motion} from "framer-motion";
import {IoIosSync} from "react-icons/io";
import {BsInfoCircle} from "react-icons/bs";

const NotificationToggle = () => {
    const {isSubscribed, registerForNotifications, revokeNotifications} = useNotificationRegistration();
    const {userId, authLoading} = useUser();

    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsEnabled(isSubscribed);
    }, [isSubscribed]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleToggle = async () => {
        if (isLoading) return;

        if (isEnabled) {
            setIsLoading(true);
            await revokeNotifications();
            setIsEnabled(false);
            setIsLoading(false);
        } else {
            setIsEnabled(true); // optimistic
            setIsLoading(true);
            try {
                await registerForNotifications();
            } catch (error) {
                console.error(error)
                setIsEnabled(false); // rollback on error
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleTooltip = () => {
        if (isMobile) {
            setTooltipVisible(prev => !prev);

            // Auto-hide tooltip after 3 seconds
            setTimeout(() => setTooltipVisible(false), 3000);
        }
    };

    if (!userId || authLoading) return null;

    return (
        <div className="flex items-center gap-2 relative">
            Notify me?
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
                className={`w-12 h-6 flex items-center rounded-full px-1 cursor-pointer transition-colors duration-300 ${
                    isEnabled ? "bg-green-500" : "bg-gray-400"
                } ${isLoading ? "opacity-70 pointer-events-none" : ""}`}
            >
                <motion.div
                    layout
                    className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${
                        isEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                >
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                key="spinner"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                className="text-gray-500 text-xs animate-spin"
                            >
                                <IoIosSync size={12}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </button>

            {/* Tooltip Icon */}
            <div
                className="relative flex items-center"
                onMouseEnter={() => !isMobile && setTooltipVisible(true)}
                onMouseLeave={() => !isMobile && setTooltipVisible(false)}
                onClick={handleTooltip}
            >
                <BsInfoCircle className="text-gray-500 cursor-pointer"/>

                <AnimatePresence>
                    {tooltipVisible && (
                        <motion.div
                            initial={{opacity: 0, y: -5}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -5}}
                            className="absolute top-full mt-4 right-0 -translate-x-1 bg-gray-800 text-white text-xs px-4 py-2 rounded shadow-md z-10 max-w-[220px] w-max text-center"
                        >
                            Turn on notifications for new uploads, features and more. Don’t worry, it won’t be many 😄
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NotificationToggle;
