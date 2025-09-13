import {
    Injectable,
    Inject,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { PaymentStatus } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { HashService } from '@shared/services/hash';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';

@Injectable()
export class CreateUserUseCase {
    constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    @Inject('HashService')
    private readonly hashService: HashService,
    ) {}

    async execute(createUserDto: CreateUserDto): Promise<User> {
        const {
            name,
            email,
            password,
            type,
            paymentId,
        } = createUserDto;

        // TODO: to use transaction to ensure data consistency
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const paymentRecord = await this.paymentRepository.findById(paymentId);
        if (!paymentRecord) {
            throw new BadRequestException('not_found.payment_record');
        }

        if (
            paymentRecord.status !== PaymentStatus.VERIFIED ||
            paymentRecord.isDeleted
        ) {
            throw new BadRequestException(
                'Payment record is not available for user creation',
            );
        }

        const hashedPassword = await this.hashService.hash(password);

        const user = User.createNewUser(
            {
                name,
                email,
                passwordHash: hashedPassword,
                type,
                paymentId,
            },
            paymentRecord.planType,
        );

        if (paymentRecord.status !== PaymentStatus.VERIFIED) {
            throw new Error('Only verified payments can be marked as used');
        }

        await this.paymentRepository.update(paymentRecord.id, {
            status: PaymentStatus.USED,
            usedAt: new Date(),
        });

        return await this.userRepository.create(user);
    }
}
