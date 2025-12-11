import type { IFilterUserPayload } from "#src/types/payloads/user-payload.ts";
import type { IUserRepository } from "#src/types/repositories/user-repository.ts";

export class DeleteUserService {
    private userRepository: IUserRepository;
    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }
    async exec(payload: IFilterUserPayload & { authId: string }) {
        const authUser = await this.userRepository.findOne({ id: payload.authId });
        if (!authUser) {
            throw new Error("You must be a valid user.");
        }
        if (payload.id != authUser.id) {
            throw new Error("You can only delete your own account.");
        }

        await this.userRepository.delete({ id: payload.id });
    }
}