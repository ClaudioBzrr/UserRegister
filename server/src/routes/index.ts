import { Router } from "express";
import { userRouter } from "./user-routes.ts";

export const routes = Router()

routes.use(userRouter)

