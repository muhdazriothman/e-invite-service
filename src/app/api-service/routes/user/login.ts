import restify from 'restify';

import { LoginUserDto } from '../../../../packages/user/application/use-cases/login/dto';
import { LoginUser } from '../../../../packages/user/application/use-cases/login/login';
import { UserRepository } from '../../../../packages/user/infra/repositories/user/repository';
import { UserMapper } from '../../../../packages/user/infra/mapper/user';

const userRepository = new UserRepository();
const loginUser = new LoginUser(userRepository);

export const loginUserRoute = (server: restify.Server): void => {
    server.post('/user/login', async (req: restify.Request, res: restify.Response, next: restify.Next) => {
        const dto = await LoginUserDto.create(req.body);

        const user = await loginUser.execute(dto);

        res.send(200, UserMapper.toDto(user));
        next();
    });
};