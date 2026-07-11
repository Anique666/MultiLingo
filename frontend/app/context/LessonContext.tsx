"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import { useAuth } from "./AuthContext";
import { playAudioFeedback } from "../utils/audio";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

import { API_BASE } from "@/app/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Client-side exercise — correct_answer intentionally omitted for security. */
export interface Exercise {
    id: number;
    type: string;
    question: string;
    options: string[];
}

export type LessonStatus =
    | "idle"
    | "validating"
    | "correct"
    | "incorrect"
    | "completed";

export interface LessonState {
    mode: "lesson" | "practice";
    userId: number;
    lessonId: number;
    exercises: Exercise[];
    currentIndex: number;
    hearts: number;
    practiceStreak: number;
    correctCount: number;
    status: LessonStatus;
    correctAnswerText: string | null;
    correctStreak: number;
    isMuted: boolean;
}

interface LessonContextValue extends LessonState {
    /** Submit the selected answer to the backend for validation. */
    submitAnswer: (answer: string) => Promise<void>;
    /** Advance to the next exercise or complete the lesson. */
    handleContinue: () => void;
    /** Toggle the audio on and off */
    toggleMute: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LessonContext = createContext<LessonContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface LessonProviderProps {
    mode?: "lesson" | "practice";
    userId: number;
    lessonId: number;
    exercises: Exercise[];
    hearts?: number;
    initialHearts?: number;
    practiceStreak?: number;
    onPracticeHeartAwarded?: () => void;
    children: React.ReactNode;
}

export function LessonProvider({
    mode = "lesson",
    userId,
    lessonId,
    exercises,
    hearts,
    initialHearts,
    practiceStreak = 0,
    onPracticeHeartAwarded,
    children,
}: LessonProviderProps) {
    const { updateUser } = useAuth();

    const [state, setState] = useState<LessonState>({
        mode,
        userId,
        lessonId,
        exercises,
        currentIndex: 0,
        hearts: initialHearts ?? hearts ?? 5,
        practiceStreak,
        correctCount: 0,
        status: "idle",
        correctAnswerText: null,
        correctStreak: 0,
        isMuted: false,
    });

    const toggleMute = useCallback(() => {
        setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    }, []);

    // Ref to prevent double-submissions while a request is in flight.
    const submitting = useRef(false);

    // -----------------------------------------------------------------------
    // submitAnswer — POST /exercises/{exercise_id}/check or POST /practice/check
    // -----------------------------------------------------------------------
    const submitAnswer = useCallback(
        async (answer: string) => {
            if (submitting.current) return;
            submitting.current = true;

            const exercise = state.exercises[state.currentIndex];
            if (!exercise) {
                submitting.current = false;
                return;
            }

            setState((prev) => ({ ...prev, status: "validating" }));

            try {
                const isPractice = state.mode === "practice";
                const url = isPractice
                    ? `${API_BASE}/practice/check`
                    : `${API_BASE}/exercises/${exercise.id}/check`;

                const body = isPractice
                    ? { exercise_id: exercise.id, answer }
                    : { answer };

                const res = await fetch(url, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                },
                );

                if (!res.ok) {
                    throw new Error(`Backend responded with ${res.status}`);
                }

                if (isPractice) {
                    const data: {
                        correct: boolean;
                        correct_answer: string;
                        practice_streak: number;
                        heart_awarded: boolean;
                        hearts_remaining: number;
                    } = await res.json();

                    if (data.heart_awarded) {
                        onPracticeHeartAwarded?.();
                        updateUser({ hearts: data.hearts_remaining });
                    }

                    const newStatus = data.correct ? "correct" : "incorrect";
                    if (!state.isMuted) {
                        playAudioFeedback(newStatus);
                    }

                    setState((prev) => ({
                        ...prev,
                        status: newStatus,
                        hearts: data.hearts_remaining,
                        practiceStreak: data.practice_streak,
                        correctCount: data.correct
                            ? prev.correctCount + 1
                            : prev.correctCount,
                        correctAnswerText: data.correct ? null : data.correct_answer,
                        correctStreak: data.correct ? prev.correctStreak + 1 : 0,
                    }));
                } else {
                    const data: {
                        correct: boolean;
                        correct_answer: string;
                        hearts_remaining: number;
                        lesson_failed: boolean;
                    } = await res.json();

                    const newStatus = data.correct ? "correct" : "incorrect";
                    if (!state.isMuted) {
                        playAudioFeedback(newStatus);
                    }

                    setState((prev) => ({
                        ...prev,
                        status: newStatus,
                        hearts: data.hearts_remaining,
                        correctCount: data.correct
                            ? prev.correctCount + 1
                            : prev.correctCount,
                        correctAnswerText: data.correct ? null : data.correct_answer,
                        correctStreak: data.correct ? prev.correctStreak + 1 : 0,
                    }));
                }
            } catch {
                // Network or server error — roll back to idle so the user can retry.
                setState((prev) => ({ ...prev, status: "idle" }));
            } finally {
                submitting.current = false;
            }
        },
        [state.exercises, state.currentIndex, state.userId, state.mode, state.isMuted, onPracticeHeartAwarded, updateUser],
    );

    // -----------------------------------------------------------------------
    // handleContinue — advance or complete or get random practice
    // -----------------------------------------------------------------------
    const handleContinue = useCallback(async () => {
        if (state.mode === "practice") {
            try {
                const res = await fetch(`${API_BASE}/practice/random`, { credentials: "include" });
                if (res.ok) {
                    const exercise: Exercise = await res.json();

                    setState((prev) => ({
                        ...prev,
                        exercises: [...prev.exercises, exercise],
                        currentIndex: prev.currentIndex + 1,
                        status: "idle",
                        correctAnswerText: null,
                    }));
                }
            } catch {
                // handle error by just staying where we are so they can retry maybe
            }
            return;
        }

        setState((prev) => {
            // If the user is out of hearts after an incorrect answer, do nothing.
            // A modal in the UI layer will handle the "no hearts" state.
            if (prev.status === "incorrect" && prev.hearts === 0) {
                return prev;
            }

            const isLastExercise = prev.currentIndex >= prev.exercises.length - 1;

            if (isLastExercise) {
                // Fire lesson-complete request without blocking the UI.
                fetch(`${API_BASE}/lessons/${prev.lessonId}/complete`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        correct_count: prev.correctCount,
                        total_exercises: prev.exercises.length,
                    }),
                }).catch(() => {
                    // Silently swallow — the completion screen is already shown.
                });

                return { ...prev, status: "completed" as const, correctAnswerText: null };
            }

            return {
                ...prev,
                currentIndex: prev.currentIndex + 1,
                status: "idle" as const,
                correctAnswerText: null,
            };
        });
    }, [state.mode]);

    return (
        <LessonContext.Provider value={{ ...state, submitAnswer, handleContinue, toggleMute }}>
            {children}
        </LessonContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLesson(): LessonContextValue {
    const context = useContext(LessonContext);
    if (!context) {
        throw new Error("useLesson must be used within a <LessonProvider>.");
    }
    return context;
}
