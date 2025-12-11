import { BcryptPasswordHasher } from "./bcrypt/bcrypt-password-hasher.ts";
import { PrismaUserRepository } from "./prisma/prisma-user-repository.ts";

export const userRepository = new PrismaUserRepository();
export const passwordHasher = new BcryptPasswordHasher();