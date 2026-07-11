"use client";

import { useEffect, useState } from "react";

import ArrangeSentence from "@/app/components/ArrangeSentence";
import CelebrationScreen from "@/app/components/CelebrationScreen";
import FeedbackFooter from "@/app/components/FeedbackFooter";
import FillBlank from "@/app/components/FillBlank";
import Matching from "@/app/components/Matching";
import MultipleChoice from "@/app/components/MultipleChoice";
import ProgressBar from "@/app/components/ProgressBar";
import Translate from "@/app/components/Translate";
import {
    LessonProvider,
    useLesson,
    type Exercise,
} from "@/context/LessonContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import { Flame } from "lucide-react";

const API_BASE = "http://localhost:8000";

function PracticePageContent() {
    const { exercises, currentIndex, status, practiceStreak } = useLesson();
    const exercise = exercises[currentIndex];

    // We should render the streak at the top
    return (
        <div className="flex min-h-screen flex-col bg-white pb-32">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4 px-6 pt-6">
                <ProgressBar />
                <div className="ml-4 flex items-center gap-2 rounded-full border-2 border-brand-orange/20 bg-brand-orange/10 px-4 py-2 font-extrabold text-brand-orange shadow-sm">
                    <Flame className="size-5 fill-current" />
                    <span>{practiceStreak}</span>
                </div>
            </div>

            <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center p-4">
                {status === "completed" ? null : exercise?.type === "multiple_choice" ? (
                    <MultipleChoice />
                ) : exercise?.type === "translate" ? (
                    <Translate />
                ) : exercise?.type === "fill_blank" ? (
                    <FillBlank />
                ) : exercise?.type === "match" ? (
                    <Matching />
                ) : exercise?.type === "arrange_sentence" ? (
                    <ArrangeSentence />
                ) : null}
            </main>

            <FeedbackFooter />
        </div>
    );
}

export default function PracticePage() {
    const { user } = useAuth();
    const [initialExercise, setInitialExercise] = useState<Exercise | null>(null);
    const [initialStats, setInitialStats] = useState<{ hearts: number; practiceStreak: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                if (!user) return; // ProtectedRoute will handle redirect

                // Fetch random exercise
                const resExercise = await fetch(`${API_BASE}/practice/random`, { credentials: "include" });
                if (!resExercise.ok) throw new Error("Failed to load exercise");
                const exercise = await resExercise.json();

                // Fetch user stats for practice streak
                const resStats = await fetch(`${API_BASE}/users/progress`, { credentials: "include" });
                if (!resStats.ok) throw new Error("Failed to load stats");
                const stats = await resStats.json();

                if (!isMounted) return;

                setInitialExercise(exercise);
                setInitialStats({ hearts: stats.hearts, practiceStreak: 0 });
                // We'll initialize practice_streak to 0 since it resets usually, but wait, the auth/me doesn't return practice_streak by default in progress. Let's just track it from 0 for the session.
            } catch (error) {
                if (!isMounted) return;
                setErrorMessage(
                    error instanceof Error ? error.message : "Unable to load practice."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadData();

        return () => {
            isMounted = false;
        };
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white p-4">
                <p className="text-xl font-extrabold text-gray-500">Loading practice...</p>
            </div>
        );
    }

    if (errorMessage !== null || initialExercise === null || initialStats === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white p-4 text-center">
                <div className="flex max-w-md flex-col gap-3">
                    <h1 className="text-2xl font-extrabold text-gray-800">Could not start practice</h1>
                    {errorMessage !== null ? (
                        <p className="break-words text-sm font-bold text-gray-400">{errorMessage}</p>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <LessonProvider
                mode="practice"
                userId={user?.id || 0}
                lessonId={0} // not used
                exercises={[initialExercise]}
                initialHearts={initialStats.hearts}
                practiceStreak={initialStats.practiceStreak}
                onPracticeHeartAwarded={() => {
                    // Find the toast element in the dom and add classes or update state
                    // To cleanly trigger it, we can use a custom event or just export the toast logic
                    window.dispatchEvent(new CustomEvent('practiceHeartAwarded'));
                }}
            >
                <PracticePageToastWrapper />
            </LessonProvider>
        </ProtectedRoute>
    );
}

// Wrapper just to handle the toast state cleanly inside the provider tree
function PracticePageToastWrapper() {
    const [showToast, setShowToast] = useState(false);
    const { exercises, currentIndex, status, practiceStreak } = useLesson();

    useEffect(() => {
        const handleHeart = () => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
        };
        window.addEventListener('practiceHeartAwarded', handleHeart);
        return () => window.removeEventListener('practiceHeartAwarded', handleHeart);
    }, []);

    return (
        <>
            <PracticePageContent />
            <div
                className={`fixed left-1/2 top-24 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-brand-red px-6 py-3 font-extrabold text-white shadow-lg transition-all duration-300 ${showToast ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"
                    }`}
            >
                <span className="text-xl">+1 ❤️!</span>
            </div>
        </>
    );
}
