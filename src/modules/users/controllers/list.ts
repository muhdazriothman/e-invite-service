import { FastifyRequest, FastifyReply } from 'fastify';

import { ListUserUseCase } from '../application/use-cases/list/use-case';
import { UserMapper } from '../infra/mappers/user';

import { UserRepository } from '../infra/repository/user/repository';
interface Service {
    userRepository: UserRepository;
}

export class ListUserController {
    private listUserUseCase: ListUserUseCase;

    constructor(listUserUseCase: ListUserUseCase) {
        if (!(listUserUseCase instanceof ListUserUseCase)) {
            throw new Error('listUserUseCase is not an instance of ListUserUseCase');
        }

        this.listUserUseCase = listUserUseCase;
    }

    static create(service: Service): ListUserController {
        const {
            userRepository
        } = service;

        return new ListUserController(
            ListUserUseCase.create({
                userRepository
            })
        );
    }

    listUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const users = await this.listUserUseCase.execute();

        const mappedUser = UserMapper.toDTOs(users);

        return reply.send({
            success: true,
            data : {
                users: mappedUser
            }
        });
    };
}
