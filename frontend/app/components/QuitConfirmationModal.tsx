"use client";

import { useRouter } from "next/navigation";

interface QuitConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

export default function QuitConfirmationModal({
    onClose,
    onConfirm,
}: QuitConfirmationModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-surface p-8 pb-6 text-center shadow-2xl">
                <div className="relative mb-2 mt-4 size-32">
                    {/* Shadow under owl */}
                    <div className="absolute -bottom-2 left-1/2 h-3 w-28 -translate-x-1/2 rounded-[100%] bg-disabled" />

                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-full drop-shadow-sm">
                        {/* Body */}
                        <path d="M14 74C14 74 14 36 14 26C14 16 22 10 32 10H48C58 10 66 16 66 26C66 36 66 74 66 74C66 78 62 82 58 82H22C18 82 14 78 14 74Z" fill="#58CC02" />
                        <path d="M14 74C14 62 14 36 14 26C14 16 22 10 32 10H48C58 10 66 16 66 26C66 50 66 66 66 74" stroke="#58CC02" strokeWidth="2" />
                        {/* Left foot */}
                        <ellipse cx="28" cy="74" rx="8" ry="5" fill="#FFC800" transform="rotate(-30 28 74)" />
                        {/* Right foot */}
                        <ellipse cx="52" cy="74" rx="8" ry="5" fill="#FFC800" transform="rotate(30 52 74)" />
                        {/* Belly */}
                        <ellipse cx="40" cy="56" rx="20" ry="14" fill="#58CC02" />
                        <path d="M28 54 C34 60, 46 60, 52 54" stroke="#46A302" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />

                        {/* Big sad eyes (Left) */}
                        <ellipse cx="28" cy="38" rx="11" ry="12" fill="white" />
                        {/* Big sad eyes (Right) */}
                        <ellipse cx="52" cy="38" rx="11" ry="12" fill="white" />

                        {/* Left pupil */}
                        <circle cx="28" cy="36" r="6" fill="#1C1C1C" />
                        <circle cx="30" cy="34" r="2.5" fill="white" />
                        <circle cx="26" cy="38" r="1" fill="white" />
                        {/* Tears left */}
                        <path d="M28 42 Q30 50 33 50 Q36 50 32 40 Z" fill="#1CB0F6" opacity="0.8" />

                        {/* Right pupil */}
                        <circle cx="52" cy="36" r="6" fill="#1C1C1C" />
                        <circle cx="54" cy="34" r="2.5" fill="white" />
                        <circle cx="50" cy="38" r="1" fill="white" />
                        {/* Tears right */}
                        <path d="M52 42 Q50 50 47 50 Q44 50 48 40 Z" fill="#1CB0F6" opacity="0.8" />

                        {/* Beak */}
                        <path d="M40 48 L35 43 H45 Z" fill="#FFC800" />
                        <path d="M40 48 C37 45, 43 45, 40 48 Z" fill="#E5B400" />
                    </svg>
                </div>

                <div className="flex flex-col gap-3 px-2">
                    <h2 className="text-[26px] font-extrabold leading-tight text-[#4B4B4B] tracking-wide">
                        Wait, don't go! You'll lose your progress if you quit now
                    </h2>
                </div>

                <div className="mt-4 flex w-full flex-col gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-tactile flex w-full items-center justify-center rounded-2xl border-2 border-brand-blue border-b-brand-blue-dark bg-brand-blue py-3.5 text-[15px] font-extrabold tracking-[0.05em] text-white uppercase"
                    >
                        KEEP LEARNING
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex w-full items-center justify-center py-3 text-[15px] font-extrabold tracking-[0.05em] text-[#FF4B4B] uppercase transition-colors hover:bg-surface-alt rounded-2xl"
                    >
                        END SESSION
                    </button>
                </div>
            </div>
        </div>
    );
}
