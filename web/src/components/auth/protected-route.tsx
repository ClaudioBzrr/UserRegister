import { isAuthenticated } from "./authenticator";
import { Navigate } from "react-router";

export function ProtectedRoute({ children }: { children: React.JSX.Element }) {
    const isAuth = isAuthenticated();
    if (!isAuth) {
        return <Navigate to="/login" replace />;
    } else {
        return children;
    }
}