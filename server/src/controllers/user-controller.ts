import { env } from "#src/lib/env.ts";
import type { IAuthRequest } from "#src/middlewares/validate-token.ts";
import { passwordHasher, userRepository } from "#src/repositories/index.ts";
import { CreateUserService } from "#src/services/create-user-service.ts";
import { DeleteUserService } from "#src/services/delete-user-service.ts";
import { FindUserService } from "#src/services/find-user-service.ts";
import { GetUserService } from "#src/services/get-user-service.ts";
import { LoginUserService } from "#src/services/login-user-service.ts";
import { UpdateUserService } from "#src/services/update-user-service.ts";
import type { IUser } from "#src/types/entities/user.ts";
import { filterUserPayload } from "#src/types/payloads/user-payload.ts";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

type SafeUser = Omit<IUser, "password">;

function toSafeUser(user: IUser): SafeUser {
    const { password: _password, ...safe } = user;
    return safe;
}

function errorStatus(err: unknown): number {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Invalid email or password")) return 401;
    if (message.includes("You must be a valid user")) return 401;
    if (message.includes("You can only")) return 403;
    if (message.includes("User not found")) return 404;
    if (message.includes("Email already registered")) return 409;
    if (message.includes("Nothing to update")) return 400;
    return 500;
}

export class UserController {
    async create(req: Request, res: Response) {
        try {
            const createUserService = new CreateUserService(userRepository, passwordHasher);
            await createUserService.exec(req.body);
            res.status(201).json({ status: "success", message: "User created successfully." });
        } catch (err) {
            res.status(errorStatus(err)).json({
                status: "error",
                message: err instanceof Error ? err.message : "Internal server error"
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const loginUserService = new LoginUserService(userRepository, passwordHasher);
            const user = await loginUserService.exec(req.body);
            const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: "1h" });
            res.cookie("token", token, {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "strict"
            });
            res.status(200).json({ status: "success", data: toSafeUser(user), token });
        } catch (err) {
            res.status(errorStatus(err)).json({
                status: "error",
                message: err instanceof Error ? err.message : "Internal server error"
            });
        }
    }

    async findMany(req: Request, res: Response) {
        try {
            const findUserService = new FindUserService(userRepository);
            const query = filterUserPayload.safeParse(req.query);
            const users = await findUserService.exec(query.success ? query.data : undefined);
            res.status(200).json({ status: "success", data: users.map(toSafeUser) });
        } catch (err) {
            res.status(errorStatus(err)).json({
                status: "error",
                message: err instanceof Error ? err.message : "Internal server error"
            });
        }
    }

    async me(req: IAuthRequest, res: Response) {
        try {
            if (!req.userId) throw new Error("You must be a valid user.");
            const getUserService = new GetUserService(userRepository);
            const user = await getUserService.exec({ id: req.userId });
            res.status(200).json({ status: "success", data: toSafeUser(user) });
        } catch (err) {
            res.status(errorStatus(err)).json({
                status: "error",
                message: err instanceof Error ? err.message : "Internal server error"
            });
        }
    }

    async update(req: IAuthRequest, res: Response) {
        try {
            if (!req.userId) throw new Error("You must be a valid user.");
            const updateUserService = new UpdateUserService(userRepository, passwordHasher);
            await updateUserService.exec({ authId: req.userId, id: req.params.id, data: req.body });
            res.status(200).json({ status: "success", message: "User updated successfully." });
        } catch (err) {
            res.status(errorStatus(err)).json({
                status: "error",
                message: err instanceof Error ? err.message : "Internal server error"
            });
        }
    }

    async delete(req: IAuthRequest, res: Response) {
        try {
            if (!req.userId) throw new Error("You must be a valid user.");
            const deleteUserService = new DeleteUserService(userRepository);
            await deleteUserService.exec({ authId: req.userId, id: req.params.id });
            res.status(200).json({ status: "success", message: "User deleted successfully." });
        } catch (err) {
            res.status(errorStatus(err)).json({
                status: "error",
                message: err instanceof Error ? err.message : "Internal server error"
            });
        }
    }
}