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
    // TODO: to use transaction to ensure data consistency
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate payment record exists and is available for user creation
    const paymentRecord = await this.paymentRepository.findById(
      createUserDto.paymentId,
    );
    if (!paymentRecord) {
      throw new BadRequestException('Payment record not found');
    }

    if (
      paymentRecord.status !== PaymentStatus.VERIFIED ||
      paymentRecord.isDeleted
    ) {
      throw new BadRequestException(
        'Payment record is not available for user creation',
      );
    }

    const hashedPassword = await this.hashService.hash(createUserDto.password);

    const user = User.createNew(
      {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: hashedPassword,
        type: createUserDto.type,
        paymentId: createUserDto.paymentId,
      },
      paymentRecord.planType,
    );

    // Mark payment record as used
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
