import type { IPasswordHasher } from "#src/types/repositories/password-repository.ts";
import { hash, compare } from "bcrypt";

export class BcryptPasswordHasher implements IPasswordHasher {
    async hash({ password }: { password: string; }): Promise<string> {
        const saltRounds = 10
        try {
            const result = await hash(password, saltRounds);
            return result;
        } catch (err) {
            throw new Error("Method not implemented.");
        }
    }
    async compare({ password, hash: hashedPassword }: { password: string; hash: string; }): Promise<boolean> {
        try {
            const result = await compare(password, hashedPassword);
            return result;
        } catch (err) {
            throw new Error("Method not implemented.");
        }
    }
}