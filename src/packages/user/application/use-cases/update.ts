import {
    Injectable,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { HashService } from '@shared/services/hash';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';

export interface UpdateUserRequest {
  name?: string;
  password?: string;
}

@Injectable()
export class UpdateUserUseCase {
    constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,

    @Inject('HashService')
    private readonly hashService: HashService,
    ) {}

    async execute(id: string, updateData: UpdateUserRequest): Promise<User> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        const updates: Partial<{ name: string; passwordHash: string }> = {};

        if (updateData.name && updateData.name !== existingUser.name) {
            updates.name = updateData.name;
        }

        if (updateData.password) {
            updates.passwordHash = await this.hashService.hash(updateData.password);
        }

        if (Object.keys(updates).length === 0) {
            return existingUser;
        }

        const updatedUser = await this.userRepository.update(id, updates);
        if (!updatedUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        return updatedUser;
    }
}
