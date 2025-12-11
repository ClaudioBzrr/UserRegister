import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from "#src/generated/prisma/client.ts";
import { env } from './env.ts';


const adapter = new PrismaBetterSqlite3({
    url: env.DATABASE_URL,
})
export const prisma = new PrismaClient({ adapter })