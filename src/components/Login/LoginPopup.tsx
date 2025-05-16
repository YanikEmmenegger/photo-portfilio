import { FC, FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { supabase } from "../../clients/supabaseClient.ts";

interface LoginPopupProps {
    onClose: () => void;
}

const LoginPopup: FC<LoginPopupProps> = ({ onClose }) => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSendOtp = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setStep("otp");
            setSuccessMsg("A 6-digit login code has been sent to your email.");
        }

        setLoading(false);
    };

    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "email",
        });

        if (error) {
            setError("Invalid or expired code.");
        } else {
            setSuccessMsg("Successfully logged in!");
            setTimeout(onClose, 10); // Close after short delay
        }

        setLoading(false);
    };

    return (
        <AnimatePresence>
            <motion.div
                key="login-backdrop"
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    key="login-modal"
                    className={twMerge(
                        "w-full max-w-md mx-4 bg-black text-gray-200 rounded-lg overflow-hidden relative p-6",
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
                            aria-label="Close login popup"
                        >
                            <RiCloseLine />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

                    {step === "email" ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1" htmlFor="login-email">Email</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className={twMerge(
                                    "w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 transition",
                                    loading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {loading ? "Sending OTP..." : "Send Login Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <p className="text-sm text-gray-400">
                                Enter the 6-digit code sent to <strong>{email}</strong>.
                            </p>

                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 tracking-widest text-center"
                                placeholder="123456"
                                pattern="\d{6}"
                                inputMode="numeric"
                                required
                                maxLength={6}
                            />

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className={twMerge(
                                    "w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 transition",
                                    loading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {loading ? "Verifying..." : "Login"}
                            </button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoginPopup;
