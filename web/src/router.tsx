import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "./pages/login";
import Users from "./pages/users";

export const routes: IRoute[] = [
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <Users />
    }
]


const router = createBrowserRouter(routes.map(r => ({
    path: r.path,
    element: r.element,
    children: r.children && r.children.length > 0 ?
        r.children.map(c => c.index && c.index == true ? ({ index: true, element: c.element }) : ({ path: c.path, element: c.element }))
        : []
})))



export const Router = () => <RouterProvider router={router} />