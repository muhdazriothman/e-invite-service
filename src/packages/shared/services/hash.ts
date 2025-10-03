import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
    static async hash (
        data: string,
    ): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(data, saltRounds);
    }

    static async compare (
        data: string,
        encrypted: string,
    ): Promise<boolean> {
        return bcrypt.compare(data, encrypted);
    }
}
