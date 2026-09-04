export interface IUser {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
}

export interface IApiResponse<T> {
    status: "success" | "error"
    message?: string
    data?: T
    token?: string
}

export interface ILoginPayload {
    email: string
    password: string
}

export interface ICreateUserPayload {
    name: string
    email: string
    password: string
}

export interface IUpdateUserPayload {
    name?: string
    email?: string
    password?: string
}