import { logger } from "#src/lib/logger.ts";
import type { ICreateUserPayload } from "#src/types/payloads/user-payload.ts";
import type { IPasswordHasher } from "#src/types/repositories/password-repository.ts";
import type { IUserRepository } from "#src/types/repositories/user-repository.ts";


export class CreateUserService {
    private userRepository: IUserRepository;
    private passwordHasher: IPasswordHasher;
    constructor(
        userRepository: IUserRepository,
        passwordHasher: IPasswordHasher
    ) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }
    async exec(payload: ICreateUserPayload) {
        logger.info("Creating new user...");
        payload.password = await this.passwordHasher.hash({ password: payload.password });
        await this.userRepository.create(payload);
        logger.info(`User ${payload.name} created successfully! `);
    }
}