"use client";

import { useEffect, useState } from "react";
import OwlMascot from "@/app/components/OwlMascot";

const SPANISH_FACTS = [
    "Spanish is the second most spoken native language in the world, behind only Mandarin Chinese.",
    "The letters 'b' and 'v' are pronounced exactly the same in Spanish.",
    "Spanish is the official or national language of 21 countries."
];

interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
    const [fact, setFact] = useState<string>("");

    useEffect(() => {
        setFact(SPANISH_FACTS[Math.floor(Math.random() * SPANISH_FACTS.length)]);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center max-w-sm text-center">
                <OwlMascot className="mb-8 h-28 w-28 animate-bounce delay-150" />
                <p className="mb-6 text-xl font-extrabold text-muted">{message}</p>

                {fact && (
                    <div className="rounded-2xl border-2 border-border bg-surface-alt p-5 mt-2">
                        <p className="mb-2 text-sm font-black uppercase tracking-wider text-brand-orange">
                            Did you know?
                        </p>
                        <p className="text-base font-bold text-muted">
                            {fact}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
