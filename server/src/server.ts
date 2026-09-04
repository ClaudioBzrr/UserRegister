import express from 'express'
import { env } from './lib/env.ts'
import { logger } from './lib/logger.ts'
import { routes } from './routes/index.ts'
import { seedAdmin } from './seed-admin.ts'
import cors from 'cors'

export const server = express()

server.use(express.json())
server.use(cors())
server.use(routes)

async function bootstrap() {
    try {
        await seedAdmin()
    } catch (err) {
        logger.error(`Admin seed failed: ${err instanceof Error ? err.message : err}`)
    }
    server.listen(env.SERVER_PORT, () => { logger.info(`Server is running on port ${env.SERVER_PORT}...`) })
}

bootstrap()