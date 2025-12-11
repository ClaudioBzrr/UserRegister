import express from 'express'
import { env } from './lib/env.ts'
import { logger } from './lib/logger.ts'

export const server = express()

server.use(express.json())

server.listen(env.SERVER_PORT, () => { logger.info(`Server is running on port ${env.SERVER_PORT}...`) })