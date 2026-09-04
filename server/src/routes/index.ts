import { Router } from "express";
import { authUserRouter, publicUserRouter } from "./user-routes.ts";

export const routes = Router();

// 1. Public — no authentication
routes.use(publicUserRouter);

// 2. Global auth — every route mounted after this requires a valid JWT
routes.use(authUserRouter);