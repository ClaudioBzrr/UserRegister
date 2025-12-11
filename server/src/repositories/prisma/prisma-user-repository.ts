import { prisma } from "#src/lib/prisma.ts";
import type { IDBDefault } from "#src/types/entities/db_default.ts";
import type { IUser } from "#src/types/entities/user.ts";
import type { IUserRepository } from "#src/types/repositories/user-repository.ts";

export class PrismaUserRepository implements IUserRepository {
    async create(data: Omit<IUser, keyof IDBDefault>): Promise<IUser> {
        try {
            const user = await prisma.user.create({ data })
            return user;
        } catch (err) {
            throw err;
        }
    }
    async findOne(filter: Partial<Omit<IUser, "password">>): Promise<IUser | null> {
        try {
            const user = await prisma.user.findFirst({
                where: filter
            });
            return user;
        } catch (err) {
            throw err;
        }
    }
    async findMany(filter?: Partial<Omit<IUser, "password">> | undefined): Promise<IUser[]> {
        try {
            const users = filter ? await prisma.user.findMany({ where: filter }) : await prisma.user.findMany();
            return users;
        } catch (err) {
            throw err;
        }
    }
    async update({ filter, data }: {
        filter: Partial<Omit<IUser, "password">>;
        data: Partial<Omit<IUser, "password" | keyof IDBDefault>>;
    }): Promise<void> {
        try {
            await prisma.user.updateMany({ where: filter, data });
        } catch (err) {
            throw err;
        }
    }
    async delete(filter: Partial<Omit<IUser, "password">>): Promise<void> {
        try {
            await prisma.user.deleteMany({ where: filter });
        } catch (err) {
            throw err;
        }
    }
}