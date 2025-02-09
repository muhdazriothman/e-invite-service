import { FastifyRequest, FastifyReply } from 'fastify';
import { Service } from '../../../service';

import { LoginUserDTO, LoginUserProps } from '../application/use-cases/login/dto';
import { LoginUserUseCase } from '../application/use-cases/login/use-case';

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
            userRepository,
        } = service;

        return new LoginUserController(
            LoginUserUseCase.create({
                userRepository,
            }),
        );
    }

    loginUser = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const dto = LoginUserDTO.create(request.body as LoginUserProps);

        const token = await this.loginUserUseCase.execute(dto);

        return reply.send({
            success: true,
            token,
        });
    };
}
