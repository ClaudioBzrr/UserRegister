import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { IApiResponse, ILoginPayload, IUser } from "../types/user";

interface IAuthContextData {
    user: IUser | null;
    signed: boolean;
    loading: boolean;
    login: (payload: ILoginPayload) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        api.get<IApiResponse<IUser>>("/users/me")
            .then((res) => {
                if (res.data) setUser(res.data);
            })
            .catch(() => logout())
            .finally(() => setLoading(false));
    }, [logout]);

    useEffect(() => {
        const handleUnauthorized = () => logout();
        window.addEventListener("unauthorized", handleUnauthorized);
        return () => window.removeEventListener("unauthorized", handleUnauthorized);
    }, [logout]);

    const login = useCallback(async (payload: ILoginPayload) => {
        const res = await api.post<IApiResponse<IUser>>("/login", payload);
        if (!res.token || !res.data) throw new Error("Login response is missing token or user data.");
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
    }, []);

    const value = useMemo<IAuthContextData>(
        () => ({
            user,
            signed: Boolean(user),
            loading,
            login,
            logout,
        }),
        [user, loading, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): IAuthContextData {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider.");
    return context;
}