declare module '*.css' {
    export const content: Record<string, string>;
    export default content;
}

declare interface IRoute {
    path: string,
    element: React.JSX.Element,
    name: string,
    icon?: React.JSX.Element
}

declare interface IUser {
    id: string,
    name: string,
    email: string,
    password: string
    createdAt: string
    updatedAt: string
}