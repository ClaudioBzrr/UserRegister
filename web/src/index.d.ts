declare module '*.css' {
    export const content: Record<string, string>;
    export default content;
}

declare type IRoute = {
    path: string,
    element: React.JSX.Element,
    name: string,
    icon?: React.JSX.Element
}