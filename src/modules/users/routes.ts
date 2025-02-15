import { FastifyInstance } from 'fastify';

import { Service } from '../../service';

import { CreateUserController } from './controllers/create';
import { ListUserController } from './controllers/list';
import { GetUserController } from './controllers/get';
import { LoginUserController } from './controllers/login';
import { DeleteUserController } from './controllers/delete';

declare module 'fastify' {
    interface FastifyInstance {
        service: Service
    }
}

// eslint-disable-next-line require-await
export async function userRoutes(fastify: FastifyInstance): Promise<void> {
    const createController = CreateUserController.create({
        userRepository: fastify.service.userRepository
    });

    const listController = ListUserController.create({
        userRepository: fastify.service.userRepository
    });

    const getController = GetUserController.create({
        userRepository: fastify.service.userRepository
    });

    const loginController = LoginUserController.create({
        userRepository: fastify.service.userRepository
    });

    const deleteController = DeleteUserController.create({
        userRepository: fastify.service.userRepository
    });

    fastify.post('/', createController.createUser);
    fastify.get('/', listController.listUser);
    fastify.get('/:id', getController.getUser);
    fastify.post('/login', loginController.loginUser);
    fastify.delete('/:id', deleteController.deleteUser);
}
