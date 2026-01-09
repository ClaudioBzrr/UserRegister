declare module '*.png'
declare module '*.jpg'

declare module '*.css' {
    const className: Record<string, string>
    export default className
}

declare type IRoute = {
    path: string
    name?: string,
    element: React.JSX.Element,
    children?: {
        path: string,
        name?: string,
        icon?: string,
        element?: string,
        index?: boolean
    }[]
}