import { FastifyRequest, FastifyReply } from 'fastify';

import { plainToInstance } from 'class-transformer';

import { LoginUserDto } from '../application/use-cases/login/dto';
import { LoginUserUseCase } from '../application/use-cases/login/use-case';

import { UserRepository } from '../infra/repository/user/repository';
interface Service {
    userRepository: UserRepository;
}

export class LoginUserController {
    private loginUserUseCase: LoginUserUseCase;

    constructor(loginUserUseCase: LoginUserUseCase) {
        if (!(loginUserUseCase instanceof LoginUserUseCase)) {
            throw new Error('loginUserUseCase is not an instance of LoginUserUseCase');
        }

        this.loginUserUseCase = loginUserUseCase;
    }

    static create(service: Service): LoginUserController {
        const {
            userRepository
        } = service;

        return new LoginUserController(
            LoginUserUseCase.create({
                userRepository
            })
        );
    }

    loginUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const dto = plainToInstance(LoginUserDto, request.body);

        const token = await this.loginUserUseCase.execute(dto);

        return reply.send({
            success: true,
            data : {
                token
            }
        });
    };
}
