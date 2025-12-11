import z from 'zod'

const envSchema = z.object({
    SERVER_PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(8),
})

export const env = envSchema.parse(process.env)