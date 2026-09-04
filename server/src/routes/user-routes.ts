import { UserController } from "#src/controllers/user-controller.ts";
import { validateToken } from "#src/middlewares/validate-token.ts";
import { validSchema } from "#src/middlewares/valid-schema.ts";
import { createUserPayload, loginUserPayload, updateUserPayload } from "#src/types/payloads/user-payload.ts";
import { Router } from "express";

const controller = new UserController();

export const publicUserRouter = Router();

publicUserRouter.post("/create-user", validSchema(createUserPayload), controller.create);
publicUserRouter.post("/login", validSchema(loginUserPayload), controller.login);

export const authUserRouter = Router();

authUserRouter.use(validateToken);
authUserRouter.get("/users/me", controller.me);
authUserRouter.get("/users", controller.findMany);
authUserRouter.put("/users/:id", validSchema(updateUserPayload), controller.update);
authUserRouter.delete("/users/:id", controller.delete);