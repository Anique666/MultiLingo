"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, API_BASE } from "../../context/AuthContext";

export default function SignupPage() {
    const [username, setUsername] = useState("");
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
            const resp = await fetch(`${API_BASE}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, email, password }),
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
                            : "Signup failed";
                setErrorMsg(msg);
            }
        } catch {
            setErrorMsg("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen max-w-sm mx-auto flex-col justify-center px-4 bg-white">
            <div className="mb-8 text-center text-3xl font-extrabold text-gray-800">
                Create your profile
            </div>

            {errorMsg ? (
                <div className="mb-4 rounded-xl border-2 border-brand-red bg-red-50 p-3 text-sm font-bold text-brand-red">
                    {errorMsg}
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 rounded-2xl border-2 border-border bg-surface-alt px-4 font-bold text-gray-700 outline-none focus:border-brand-blue"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl border-2 border-border bg-surface-alt px-4 font-bold text-gray-700 outline-none focus:border-brand-blue"
                    required
                />
                <input
                    type="password"
                    placeholder="Password (8+ characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    className="h-12 rounded-2xl border-2 border-border bg-surface-alt px-4 font-bold text-gray-700 outline-none focus:border-brand-blue"
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary mt-2 h-12 w-full text-base"
                >
                    {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                </button>
            </form>

            <div className="mt-8 text-center font-bold text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-brand-blue hover:underline">
                    Log in
                </Link>
            </div>
        </div>
    );
}
