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

    async exec({ authId, id, data }: { authId: string; id: string; data: IUpdateUserPayload }) {
        const authUser = await this.userRepository.findOne({ id: authId });
        if (!authUser) {
            throw new Error("You must be a valid user.");
        }
        if (id !== authUser.id) {
            throw new Error("You can only update your own account.");
        }
        if (!Object.keys(data).length) {
            throw new Error("Nothing to update.");
        }
        if (data.email && data.email !== authUser.email) {
            const existing = await this.userRepository.findOne({ email: data.email });
            if (existing) {
                throw new Error("Email already registered.");
            }
        }

        const payload = { ...data } as IUpdateUserPayload;
        if (payload.password) {
            payload.password = await this.passwordHasher.hash({ password: payload.password });
        }

        await this.userRepository.update({ filter: { id }, data: payload });
    }
}