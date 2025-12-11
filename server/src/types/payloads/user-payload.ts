import z from "zod";

export const createUserPayload = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(6)
}).strict();

export const filterUserPayload = z.object({
    id: z.uuid().optional(),
    name: z.string().min(1).optional(),
    email: z.email().optional()
}).strict()

export const updateUserPayload = z.object({
    filter: z.object({
        id: z.uuid().optional(),
    }).strict(),
    data: z.object({
        name: z.string().min(1).optional(),
        email: z.email().optional(),
        password: z.string().min(6).optional()
    })
}).strict();

export const deleteUserPayload = z.object({
    id: z.uuid()
}).strict();


export const loginUserPayload = z.object({
    email: z.email(),
    password: z.string().min(6)
}).strict();

export type ICreateUserPayload = z.infer<typeof createUserPayload>;
export type IFilterUserPayload = z.infer<typeof filterUserPayload>;
export type IUpdateUserPayload = z.infer<typeof updateUserPayload>;
export type IDeleteUserPayload = z.infer<typeof deleteUserPayload>;
export type ILoginUserPayload = z.infer<typeof loginUserPayload>;

