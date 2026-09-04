import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { ToastProvider } from "./contexts/toast-context";
import AppShell from "./components/app-shell";
import Login from "./pages/login";
import Users from "./pages/users";
import type { ReactNode } from "react";

function PrivateRoute({ children }: { children: ReactNode }) {
    const { signed, loading } = useAuth();
    if (loading) return <div className="page-loader">Loading...</div>;
    if (!signed) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
    const { signed, loading } = useAuth();
    if (loading) return <div className="page-loader">Loading...</div>;
    if (signed) return <Navigate to="/users" replace />;
    return <>{children}</>;
}

const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <PublicOnlyRoute>
                <Login />
            </PublicOnlyRoute>
        ),
    },
    {
        element: (
            <PrivateRoute>
                <AppShell />
            </PrivateRoute>
        ),
        children: [
            {
                path: "/users",
                element: <Users />,
            },
        ],
    },
    {
        path: "/",
        element: <Navigate to="/users" replace />,
    },
    {
        path: "*",
        element: <Navigate to="/users" replace />,
    },
]);

export function Router() {
    return (
        <AuthProvider>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </AuthProvider>
    );
}