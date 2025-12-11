import { env } from "#src/lib/env.ts";
import { logger } from "#src/lib/logger.ts";
import { passwordHasher, userRepository } from "#src/repositories/index.ts";
import { CreateUserService } from "#src/services/create-user-service.ts";
import { LoginUserService } from "#src/services/login-user-service.ts";
import type { Request, Response } from "express";
import jwt from 'jsonwebtoken'

export class UserController {

    async create(req: Request, res: Response) {
        try {
            const createUserService = new CreateUserService(userRepository, passwordHasher)
            await createUserService.exec(req.body);
            res.status(201).json({ status: 'success', message: "User created successfully." });
        } catch (err) {
            logger.error(err instanceof Error ? err.message : err);
            res.status(500).json({ status: 'error', message: err instanceof Error ? err.message : "Internal server error" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const loginUserService = new LoginUserService(userRepository, passwordHasher)
            const user = await loginUserService.exec(req.body);
            const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            res.status(200).json({ status: 'success', data: user });
        } catch (err) {
            logger.error(err instanceof Error ? err.message : err);
            res.status(500).json({ status: 'error', message: err instanceof Error ? err.message : "Internal server error" });
        }
    }
}