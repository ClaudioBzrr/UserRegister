import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
import Users from "./pages/users";
import { ProtectedRoute } from "./components/auth/protected-route";

export const routes: IRoute[] = [
    {
        path: '/',
        element: <ProtectedRoute children={<Users />} />,
        name: 'Users'
    },
    {
        path: '/login',
        element: <Login />,
        name: 'Login'
    }
]


export function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {
                    routes.map((route, index) => <Route key={index} path={route.path} element={route.element} />)
                }
            </Routes>
        </BrowserRouter>
    )
}