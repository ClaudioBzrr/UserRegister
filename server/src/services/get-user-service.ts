import type { IUserRepository } from "#src/types/repositories/user-repository.ts";

export class GetUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async exec(filter: { id: string }) {
        const user = await this.userRepository.findOne(filter);
        if (!user) {
            throw new Error("User not found.");
        }
        return user;
    }
}