import { FC, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { useNotificationRegistration } from "../../utils/useNotifications";

interface NotificationPopupProps {
    onClose: () => void;
}

const NotificationPopup: FC<NotificationPopupProps> = ({ onClose }) => {
    const { registerForNotifications } = useNotificationRegistration();

    const handleEnable = async () => {
        try {
            await registerForNotifications();
        } catch (error) {
            console.error("Notification permission failed:", error);
        } finally {
            onClose(); // Close in all cases
        }
    };

    // Escape key closes the popup
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                key="notif-backdrop"
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    key="notif-modal"
                    className={twMerge(
                        "w-full max-w-md mx-4 bg-black text-gray-200 rounded-lg overflow-hidden relative p-10",
                        "sm:rounded-lg sm:p-6 sm:mx-auto",
                        "max-h-[90vh] overflow-y-auto"
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={onClose}
                            className="text-2xl text-gray-400 hover:text-gray-100"
                            aria-label="Close notification popup"
                        >
                            <RiCloseLine />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-4 text-center">Enable Desktop Notifications</h2>
                    <p className="text-sm text-gray-400 text-center mb-6">
                        Turn on notifications for new uploads, features and more. Don’t worry, it won’t be many 😄
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="w-1/2 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
                        >
                            No Thanks
                        </button>
                        <button
                            onClick={handleEnable}
                            className="w-1/2 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
                        >
                            Enable
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationPopup;
