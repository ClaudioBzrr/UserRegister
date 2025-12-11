import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
import Users from "./pages/users";

export const routes: IRoute[] = [
    {
        path: '/',
        element: <Users />,
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