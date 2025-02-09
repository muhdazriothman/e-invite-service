import { FastifyRequest, FastifyReply } from 'fastify';
import { Service } from '../../../service';

import { CreateUserDTO, CreateUserProps } from '../application/use-cases/create/dto';
import { CreateUserUseCase } from '../application/use-cases/create/use-case';
import { UserMapper } from '../infra/mappers/user';

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
            userRepository,
        } = service;

        return new CreateUserController(
            CreateUserUseCase.create({
                userRepository,
            }, {
                saltRounds: 10,
            }),
        );
    }

    createUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const dto = CreateUserDTO.create(request.body as CreateUserProps);

        const user = await this.createUserUseCase.execute(dto);

        const mappedUser = UserMapper.toDTO(user);

        return reply.status(201).send({
            success: true,
            user: mappedUser,
        });
    };
}
