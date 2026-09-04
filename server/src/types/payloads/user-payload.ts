import z from "zod";

export const createUserPayload = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.email("A valid email is required."),
    password: z.string().min(6, "Password must be at least 6 characters.")
}).strict();

export const updateUserPayload = z.object({
    name: z.string().min(1).optional(),
    email: z.email().optional(),
    password: z.string().min(6).optional()
}).strict();

export const filterUserPayload = z.object({
    id: z.uuid().optional(),
    name: z.string().min(1).optional(),
    email: z.email().optional()
}).strict();

export const loginUserPayload = z.object({
    email: z.email("A valid email is required."),
    password: z.string().min(6)
}).strict();

export type ICreateUserPayload = z.infer<typeof createUserPayload>;
export type IUpdateUserPayload = z.infer<typeof updateUserPayload>;
export type IFilterUserPayload = z.infer<typeof filterUserPayload>;
export type ILoginUserPayload = z.infer<typeof loginUserPayload>;