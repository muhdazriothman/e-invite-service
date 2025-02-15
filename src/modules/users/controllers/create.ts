import { FastifyRequest, FastifyReply } from 'fastify';

import { plainToInstance } from 'class-transformer';

import { CreateUserDto } from '../application/use-cases/create/dto';
import { CreateUserUseCase } from '../application/use-cases/create/use-case';

import { UserMapper } from '../infra/mappers/user';
import { UserRepository } from '../infra/repository/user/repository';

interface Service {
    userRepository: UserRepository;
}

export class CreateUserController {
    private createUserUseCase: CreateUserUseCase;

    constructor(createUserUseCase: CreateUserUseCase) {
        if (!(createUserUseCase instanceof CreateUserUseCase)) {
            throw new Error('createUserUseCase is not an instance of CreateUserUseCase');
        }

        this.createUserUseCase = createUserUseCase;
    }

    static create(service: Service): CreateUserController {
        const {
            userRepository
        } = service;

        return new CreateUserController(
            CreateUserUseCase.create({
                userRepository
            }, {
                saltRounds: 10
            })
        );
    }

    createUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const dto = plainToInstance(CreateUserDto, request.body);

        const user = await this.createUserUseCase.execute(dto);

        const mappedUser = UserMapper.toDTO(user);

        return reply.status(201).send({
            success: true,
            data : {
                user: mappedUser
            }
        });
    };
}
