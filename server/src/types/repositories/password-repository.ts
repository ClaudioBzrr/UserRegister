export interface IPasswordHasher {
    hash: ({ password }: { password: string }) => Promise<string>,
    compare: ({ hash }: { password: string, hash: string }) => Promise<boolean>
}