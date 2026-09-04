import z from 'zod'

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value)

const envSchema = z.object({
    SERVER_PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(8),
    ADMIN_EMAIL: z.preprocess(emptyToUndefined, z.email().optional()),
    ADMIN_PASSWORD: z.preprocess(emptyToUndefined, z.string().min(6).optional()),
})

export const env = envSchema.parse(process.env)