import type { IFilterUserPayload } from "#src/types/payloads/user-payload.ts";
import type { IUserRepository } from "#src/types/repositories/user-repository.ts";

export class FindUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async exec(payload?: IFilterUserPayload) {
        const users = await this.userRepository.findMany(payload);
        return users;
    }

}