"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, API_BASE } from "../../context/AuthContext";
import OwlMascot from "../../components/OwlMascot";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsSubmitting(true);

        try {
            const resp = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (resp.ok) {
                const user = await resp.json();
                login(user);
                router.push("/sections");
            } else {
                const data = await resp.json();
                const msg =
                    typeof data.detail === "string"
                        ? data.detail
                        : Array.isArray(data.detail)
                            ? data.detail.map((d: { msg: string }) => d.msg).join(", ")
                            : "Login failed";
                setErrorMsg(msg);
            }
        } catch {
            setErrorMsg("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen max-w-sm mx-auto flex-col justify-center px-4 bg-background">
            <div className="flex justify-center mb-6">
                <OwlMascot className="w-24 h-24" />
            </div>
            <div className="mb-8 text-center text-3xl font-extrabold text-foreground">
                Log in to continue
            </div>

            {errorMsg ? (
                <div className="mb-4 rounded-xl border-2 border-brand-red bg-red-50 p-3 text-sm font-bold text-brand-red">
                    {errorMsg}
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl border-2 border-border bg-surface-alt px-4 font-bold text-foreground outline-none focus:border-brand-blue"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border-2 border-border bg-surface-alt px-4 font-bold text-foreground outline-none focus:border-brand-blue"
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn-tactile mt-2 flex h-14 w-full items-center justify-center rounded-2xl border-brand-green-dark bg-brand-green text-lg font-black uppercase tracking-widest text-white shadow-sm transition-all hover:brightness-105 ${isSubmitting
                        ? "translate-y-1 border-b-0 opacity-80 shadow-none"
                        : "border-b-4 active:translate-y-1 active:border-b-0 active:shadow-none"
                        }`}
                >
                    {isSubmitting ? "LOGGING IN..." : "LOG IN"}
                </button>
            </form>

            <div className="mt-8 text-center font-bold text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-brand-blue hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
