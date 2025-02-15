import { UserRepository } from './modules/users/infra/repository/user/repository';
import { InvitationRepository } from './modules/invitation/infra/repositories/invitation/repository';
export class Service {
    userRepository: UserRepository;
    invitationRepository: InvitationRepository;

    constructor(dependencies: Service) {
        const {
            userRepository,
            invitationRepository
        } = dependencies;

        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
    }

    static create(): Service {
        return new Service({
            userRepository: new UserRepository(),
            invitationRepository: new InvitationRepository()
        });
    }
}
