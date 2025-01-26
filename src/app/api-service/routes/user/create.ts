import restify from 'restify';

import { CreateUserDto } from '../../../../packages/user/application/use-cases/create/dto';
import { CreateUser } from '../../../../packages/user/application/use-cases/create/create';
import { UserRepository } from '../../../../packages/user/infra/repositories/user/repository';
import { UserMapper } from '../../../../packages/user/infra/mapper/user';

const userRepository = new UserRepository();
const createUser = new CreateUser(userRepository);

export const createUserRoute = (server: restify.Server): void => {
    server.post('/user', async (req: restify.Request, res: restify.Response, next: restify.Next) => {
        const dto = await CreateUserDto.create(req.body);

        const user = await createUser.execute(dto);

        res.send(201, UserMapper.toDto(user));
        next();
    });
};