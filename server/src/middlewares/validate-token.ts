import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "#src/lib/env.ts";

export interface IAuthRequest extends Request {
    userId?: string;
}

function parseCookies(cookieHeader?: string): Record<string, string> {
    if (!cookieHeader) return {};
    return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
        const [rawKey, ...rawValue] = part.trim().split("=");
        if (rawKey) acc[rawKey] = rawValue.join("=");
        return acc;
    }, {});
}

export function validateToken(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ")
        ? header.slice("Bearer ".length)
        : parseCookies(req.headers.cookie).token;

    if (!token) {
        return res.status(401).json({ status: "error", message: "No token provided." });
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { id: string };
        (req as IAuthRequest).userId = payload.id;
        next();
    } catch {
        return res.status(401).json({ status: "error", message: "Invalid or expired token." });
    }
}