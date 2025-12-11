import express from 'express'
import { env } from './lib/env.ts'
import { logger } from './lib/logger.ts'
import { routes } from './routes/index.ts'

export const server = express()

server.use(express.json())
server.use(routes)

server.listen(env.SERVER_PORT, () => { logger.info(`Server is running on port ${env.SERVER_PORT}...`) })