import type { IDBDefault } from "./db_default.ts"

export interface IUser extends IDBDefault {
    name: string
    email: string
    password: string
}