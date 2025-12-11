import { UserController } from "#src/controllers/user-controller.ts";
import { validSchema } from "#src/middlewares/valid-schema.ts";
import { createUserPayload, loginUserPayload } from "#src/types/payloads/user-payload.ts";
import { Router } from "express";


export const userRouter = Router();


userRouter.post('/user', validSchema(createUserPayload), new UserController().create)
userRouter.post('/login', validSchema(loginUserPayload), new UserController().login)