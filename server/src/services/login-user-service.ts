import type { ILoginUserPayload } from "#src/types/payloads/user-payload.ts";
import type { IPasswordHasher } from "#src/types/repositories/password-repository.ts";
import type { IUserRepository } from "#src/types/repositories/user-repository.ts";

export class LoginUserService {
    private userRepository: IUserRepository;
    private passwordHasher: IPasswordHasher;

    constructor(userRepository: IUserRepository, passwordHasher: IPasswordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    async exec(payload: ILoginUserPayload) {
        const user = await this.userRepository.findOne({ email: payload.email });
        if (!user) {
            throw new Error("Invalid email or password.");
        }
        const isPasswordValid = await this.passwordHasher.compare({
            password: payload.password,
            hash: user.password
        });

        if (!isPasswordValid) {
            throw new Error("Invalid email or password.");
        }

        return user;
    }
}