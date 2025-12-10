import type { IUser } from "./user.ts"

export interface ISensitive {
    password: IUser['password']
}