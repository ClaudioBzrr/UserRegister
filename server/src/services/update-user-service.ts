import type { IUpdateUserPayload } from "#src/types/payloads/user-payload.ts";
import type { IPasswordHasher } from "#src/types/repositories/password-repository.ts";
import type { IUserRepository } from "#src/types/repositories/user-repository.ts";

export class UpdateUserService {
    private userRepository: IUserRepository;
    private passwordHasher: IPasswordHasher;

    constructor(userRepository: IUserRepository, passwordHasher: IPasswordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    async exec(payload: IUpdateUserPayload & { authId: string }) {
        const authUser = await this.userRepository.findOne({ id: payload.authId });
        if (!authUser) {
            throw new Error("You must be a valid user.");
        }
        if (payload.filter.id != authUser.id) {
            throw new Error("You can only update your own account.");
        }
        if (payload.data.password) {
            payload.data.password = await this.passwordHasher.hash({ password: payload.data.password });
        }

        await this.userRepository.update(({
            filter: payload.filter,
            data: payload.data
        }));
    }
}