import type { IDBDefault } from "./db_default.ts";
import type { ISensitive } from "./sensitive.ts";

export interface IRepository<T> {
    create: (data: Omit<T, keyof IDBDefault>) => Promise<T>,
    findOne: (filter: Partial<Omit<T, keyof ISensitive>>) => Promise<T | null>,
    findMany: (filter?: Partial<Omit<T, keyof ISensitive>>) => Promise<T[]>,
    update: ({
        filter,
        data
    }: {
        filter: Partial<Omit<T, keyof ISensitive>>,
        data: Partial<Omit<T, keyof IDBDefault | keyof ISensitive>>
    }) => Promise<void>,
    delete: (filter: Partial<Omit<T, keyof ISensitive>>) => Promise<void>,
}