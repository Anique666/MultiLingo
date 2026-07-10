"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = "http://127.0.0.1:8000";

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
    userId: number;
    lessonId: number;
    exercises: Exercise[];
    currentIndex: number;
    hearts: number;
    correctCount: number;
    status: LessonStatus;
    correctAnswerText: string | null;
}

interface LessonContextValue extends LessonState {
    /** Submit the selected answer to the backend for validation. */
    submitAnswer: (answer: string) => Promise<void>;
    /** Advance to the next exercise or complete the lesson. */
    handleContinue: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LessonContext = createContext<LessonContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface LessonProviderProps {
    userId: number;
    lessonId: number;
    exercises: Exercise[];
    hearts?: number;
    initialHearts?: number;
    children: React.ReactNode;
}

export function LessonProvider({
    userId,
    lessonId,
    exercises,
    hearts,
    initialHearts,
    children,
}: LessonProviderProps) {
    const [state, setState] = useState<LessonState>({
        userId,
        lessonId,
        exercises,
        currentIndex: 0,
        hearts: initialHearts ?? hearts ?? 5,
        correctCount: 0,
        status: "idle",
        correctAnswerText: null,
    });

    // Ref to prevent double-submissions while a request is in flight.
    const submitting = useRef(false);

    // -----------------------------------------------------------------------
    // submitAnswer — POST /exercises/{exercise_id}/check
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
                const res = await fetch(
                    `${API_BASE}/exercises/${exercise.id}/check`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: state.userId, answer }),
                    },
                );

                if (!res.ok) {
                    throw new Error(`Backend responded with ${res.status}`);
                }

                const data: {
                    correct: boolean;
                    correct_answer: string;
                    hearts_remaining: number;
                    lesson_failed: boolean;
                } = await res.json();

                setState((prev) => ({
                    ...prev,
                    status: data.correct ? "correct" : "incorrect",
                    hearts: data.hearts_remaining,
                    correctCount: data.correct
                        ? prev.correctCount + 1
                        : prev.correctCount,
                    correctAnswerText: data.correct ? null : data.correct_answer,
                }));
            } catch {
                // Network or server error — roll back to idle so the user can retry.
                setState((prev) => ({ ...prev, status: "idle" }));
            } finally {
                submitting.current = false;
            }
        },
        [state.exercises, state.currentIndex, state.userId],
    );

    // -----------------------------------------------------------------------
    // handleContinue — advance or complete
    // -----------------------------------------------------------------------
    const handleContinue = useCallback(() => {
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: prev.userId,
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
    }, []);

    return (
        <LessonContext.Provider value={{ ...state, submitAnswer, handleContinue }}>
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
