"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ArrangeSentence from "@/app/components/ArrangeSentence";
import CelebrationScreen from "@/app/components/CelebrationScreen";
import FeedbackFooter from "@/app/components/FeedbackFooter";
import FillBlank from "@/app/components/FillBlank";
import Matching from "@/app/components/Matching";
import MultipleChoice from "@/app/components/MultipleChoice";
import OutOfHeartsModal from "@/app/components/OutOfHeartsModal";
import OwlMascot from "@/app/components/OwlMascot";
import ProgressBar from "@/app/components/ProgressBar";
import Translate from "@/app/components/Translate";
import {
  LessonProvider,
  useLesson,
  type Exercise,
} from "@/context/LessonContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";

const API_BASE = "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 8000;

interface LessonResponse {
  id: number;
  exercises: Exercise[];
}

interface UserProgressResponse {
  hearts: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal, credentials: "include" });

    if (!response.ok) {
      throw new Error(`${url} failed with ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function LessonPageContent() {
  const { exercises, currentIndex, status } = useLesson();
  const exercise = exercises[currentIndex];

  return (
    <div className="flex min-h-screen flex-col bg-white pb-32">
      <ProgressBar />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center p-4 md:flex-row md:items-start md:gap-8 md:pt-12">
        {status !== "completed" && exercise && (
          <div className="mb-8 flex shrink-0 justify-center md:mb-0 md:mt-4">
            <OwlMascot
              className={`h-24 w-24 md:h-32 md:w-32 ${status === "correct" ? "mascot-bounce" : ""
                }`}
            />
          </div>
        )}
        <div className="flex w-full max-w-2xl flex-col">
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
        </div>
      </main>

      <OutOfHeartsModal />
      <CelebrationScreen />
      <FeedbackFooter />
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lessonId = Number(params.id);
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [initialHearts, setInitialHearts] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLesson() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        if (!user) return; // ProtectedRoute will handle redirect, but wait just in case

        const progress = await fetchJson<UserProgressResponse>(
          `${API_BASE}/users/progress`,
        );
        const lessonData = await fetchJson<LessonResponse>(
          `${API_BASE}/lessons/${lessonId}`,
        );

        if (!isMounted) {
          return;
        }

        setInitialHearts(progress.hearts);
        setLesson(lessonData);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the lesson.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <p className="text-xl font-extrabold text-gray-500">
          Loading your lesson...
        </p>
      </div>
    );
  }

  if (errorMessage !== null || lesson === null || initialHearts === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4 text-center">
        <div className="flex max-w-md flex-col gap-3">
          <h1 className="text-2xl font-extrabold text-gray-800">
            Could not load this lesson
          </h1>
          <p className="font-bold text-gray-500">
            Make sure the FastAPI backend is running on
            {" "}http://localhost:8000.
          </p>
          {errorMessage !== null ? (
            <p className="break-words text-sm font-bold text-gray-400">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <LessonProvider
        userId={user?.id || 0}
        lessonId={lesson.id}
        exercises={lesson.exercises}
        initialHearts={initialHearts}
      >
        <LessonPageContent />
      </LessonProvider>
    </ProtectedRoute>
  );
}
