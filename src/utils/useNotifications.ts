import {useEffect} from "react";
import {supabase} from "../clients/supabaseClient";
import {useUser} from "../contexts/UserContext.tsx";

// Your public VAPID key (get this from your backend later)
const VAPID_PUBLIC_KEY =
    "BG3cnLsLaFFQyVgNEXknUOSKiQGnMSXgk1_hrDasT-n8OxVreohXjS1Y833k4Mf80NQ7JeDDwsdDGWm0ti_NaWE";

export const useNotificationRegistration = () => {
    const {userId, isSubscribed, setIsSubscribed} = useUser();

    // ✅ Load subscription state on mount
    useEffect(() => {
        const fetchSubscription = async () => {
            if (!userId) return;

            const {data, error} = await supabase
                .from("notification_devices")
                .select("is_active")
                .eq("user_id", userId)
                .eq("is_active", true)
                .maybeSingle();

            if (!error && data) setIsSubscribed(true);
        };

        fetchSubscription();
    }, [userId]);

    const registerForNotifications = async () => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            alert("Push notifications are not supported.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.register("/notification-sw.js");

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        if (!userId) return;

        const {error} = await supabase
            .from("notification_devices")
            .upsert({
                user_id: userId,
                endpoint: JSON.stringify(subscription),
                is_active: true,
            });

        if (!error) {
            setIsSubscribed(true);
            await registration.showNotification("Notifications enabled", {
                body: "You will be notified when new content is uploaded 🎉",
                icon: "/favicon.ico",
                tag: "test-notification",
            });
        }
    };

    const revokeNotifications = async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();

            if (userId) {
                await supabase
                    .from("notification_devices")
                    .delete()
                    .eq("user_id", userId)
                    .eq("endpoint", JSON.stringify(subscription));
            }

            setIsSubscribed(false);
        }
    };

    return {isSubscribed, registerForNotifications, revokeNotifications};
};

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
