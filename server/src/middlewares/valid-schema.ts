import z from "zod";
import type { Request, Response, NextFunction } from 'express'
import { logger } from "#src/lib/logger.ts";
export const validSchema = (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            logger.error("Schema validation error:", err.issues);
            return res.status(400).json({
                message: "Invalid request data",
                errors: err.issues[0].message
            });
        } else {
            logger.error("Unexpected error during schema validation:", err);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    }
}