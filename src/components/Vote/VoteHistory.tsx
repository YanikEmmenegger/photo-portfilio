import { useUser } from "../../contexts/UserContext.tsx";
import { Vote } from "../../types/types.ts";
import HistoryItem from "./HistoryItem.tsx";
import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const VoteHistory = () => {
    const { votes } = useUser();
    const [showHistory, setShowHistory] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showHistory && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [showHistory]);

    if (votes.length === 0) return <></>;

    return (
        <div className="w-full text-center py-20" ref={containerRef}>
            <button
                onClick={() => setShowHistory((prev) => !prev)}
                className="mx-auto mb-6 flex items-center gap-2 px-4 py-2 border border-neutral-700 text-white rounded-md hover:bg-neutral-800 transition duration-300"
            >
                {showHistory ? "Hide Vote History" : "Show Vote History"}
                {showHistory ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>

            <div
                className={twMerge(
                    "w-[95vw] mx-auto flex flex-wrap gap-4 justify-center items-center transition-all duration-500 ease-in-out",
                    !showHistory && "opacity-0 max-h-0 overflow-hidden scale-95",
                    showHistory && "opacity-100 max-h-[3000px] scale-100"
                )}
            >
                {votes.map((vote: Vote, index) => (
                    <div
                        key={vote.vote_id}
                        className="transition-all duration-500 ease-in-out opacity-0 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <HistoryItem vote={vote} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoteHistory;
