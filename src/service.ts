import { UserRepository } from './modules/users/infra/repository/user/repository';

export class Service {
    userRepository: UserRepository;

    constructor(dependencies: Service) {
        const {
            userRepository,
        } = dependencies;

        this.userRepository = userRepository;
    }

    static create(): Service {
        return new Service({
            userRepository: new UserRepository(),
        });
    }
}
