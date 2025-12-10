import type { IRepository } from "../entities/repository.ts";
import type { IUser } from "../entities/user.ts";

export interface IUserRepository extends IRepository<IUser> { }