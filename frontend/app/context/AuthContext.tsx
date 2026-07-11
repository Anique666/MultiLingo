"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

/** Base URL for all backend API calls. */
export const API_BASE = "http://localhost:8000";

export interface User {
    id: number;
    username: string;
    email: string;
    xp: number;
    streak: number;
    hearts: number;
    last_active: string | null;
    created_at: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (partialUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch(`${API_BASE}/auth/me`, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = (await response.json()) as User;
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        void fetchUser();
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
    };

    const updateUser = (partialUser: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...partialUser } : prev));
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Ignored — cookie is cleared server-side
        }
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
