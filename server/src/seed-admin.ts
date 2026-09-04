import { env } from "./lib/env.ts";
import { logger } from "./lib/logger.ts";
import { passwordHasher, userRepository } from "./repositories/index.ts";
import { CreateUserService } from "./services/create-user-service.ts";

const ADMIN_NAME = "Admin";

export async function seedAdmin(): Promise<void> {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
        return;
    }

    const existing = await userRepository.findOne({ email: env.ADMIN_EMAIL });
    if (existing) {
        return;
    }

    const createUserService = new CreateUserService(userRepository, passwordHasher);
    await createUserService.exec({
        name: ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
    });
    logger.info(`Seeded initial admin user ${env.ADMIN_EMAIL}`);
}