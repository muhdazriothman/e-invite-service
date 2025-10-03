import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Payment,
    PaymentStatus,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { paymentErrors } from '@shared/constants/error-codes';
import { HashService } from '@shared/services/hash';
import { UserService } from '@user/application/services/user';
import { User } from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';

@Injectable()
export class CreateUserUseCase {
    constructor (
        private readonly userRepository: UserRepository,

        private readonly paymentRepository: PaymentRepository,

        private readonly userService: UserService,
    ) { }

    async execute (
        createUserDto: CreateUserDto,
    ): Promise<User> {
        try {
            const {
                name,
                email,
                password,
                type,
                paymentId,
            } = createUserDto;

            await this.userService.validateSameEmailExists(email);

            const paymentRecord = await this.validatePaymentRecord(paymentId);

            const hashedPassword = await HashService.hash(password);

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

            // TODO: use transaction to update payment record and create user
            await this.paymentRepository.updateById(paymentRecord.id, {
                status: PaymentStatus.USED,
                usedAt: new Date(),
            });

            return await this.userRepository.create(user);
        } catch (error) {
            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(error);
        }
    }

    async validatePaymentRecord (
        paymentId: string,
    ): Promise<Payment> {
        const paymentRecord = await this.paymentRepository.findById(paymentId);
        if (!paymentRecord || paymentRecord.isDeleted) {
            throw new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND);
        }

        if (paymentRecord.status !== PaymentStatus.VERIFIED) {
            throw new BadRequestException(paymentErrors.PAYMENT_MUST_BE_VERIFIED);
        }

        return paymentRecord;
    }
}
