"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, X, Volume2, VolumeX } from "lucide-react";

import { useLesson } from "@/context/LessonContext";
import QuitConfirmationModal from "./QuitConfirmationModal";

export default function ProgressBar() {
  const router = useRouter();
  const { currentIndex, exercises, hearts, isMuted, toggleMute } = useLesson();
  const [showQuitModal, setShowQuitModal] = useState(false);

  const progressPercentage =
    exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 p-4 pt-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowQuitModal(true)}
            aria-label="Close lesson"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X aria-hidden="true" className="size-7" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            {isMuted ? (
              <VolumeX aria-hidden="true" className="size-7" />
            ) : (
              <Volume2 aria-hidden="true" className="size-7" />
            )}
          </button>
        </div>

        <div className="flex-1">
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-brand-green transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Heart
            aria-hidden="true"
            className="size-7 fill-current text-brand-red"
          />
          <span className="text-lg font-extrabold text-brand-red">{hearts}</span>
        </div>
      </div>

      {showQuitModal && (
        <QuitConfirmationModal
          onClose={() => setShowQuitModal(false)}
          onConfirm={() => router.push("/learn")}
        />
      )}
    </>
  );
}
