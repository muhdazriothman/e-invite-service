import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashService } from '@user/application/interfaces/hash-service';

@Injectable()
export class HashServiceImpl implements HashService {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}
