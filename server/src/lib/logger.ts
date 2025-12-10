import { createLogger, format, transports } from 'winston'
import { env } from './env.ts'

const timezoned = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }).replace(/,/g, '')

const customFormat = format.printf(info => [
    `[${env.NODE_ENV.toUpperCase()}]`,
    `[${info.timestamp}]`,
    `${format.colorize().colorize(info.level, info.level.toUpperCase())}:`,
    `${info.message}`
].join(' '))

export const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: timezoned }),
        format.json()
    ),

    transports: [
        new transports.Console({
            format: format.combine(
                format.timestamp({ format: timezoned }),
                format.errors({ stack: true }),
                customFormat
            )
        }),

        new transports.File({
            format: format.combine(
                format.errors({ stack: true }),
                format.timestamp({ format: timezoned })
            ),
            filename: 'logs/error.log',
            level: 'error'
        }),
        new transports.File({
            format: format.combine(
                format.errors({ stack: true }),
                format.timestamp({ format: timezoned })
            ),
            filename: 'logs/combined.log'
        })
    ]
})

