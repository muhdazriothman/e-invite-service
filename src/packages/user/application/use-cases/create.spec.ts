import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { PaymentStatus } from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import {
    paymentErrors,
    userErrors,
} from '@shared/constants/error-codes';
import { HashService } from '@shared/services/hash';
import { PaymentFixture } from '@test/fixture/payment';
import { UserFixture } from '@test/fixture/user';
import { createMock } from '@test/utils/mocks';
import { UserService } from '@user/application/services/user';
import { CreateUserUseCase } from '@user/application/use-cases/create';
import {
    User,
    UserType,
} from '@user/domain/entities/user';
import { UserRepository } from '@user/infra/repository';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';

describe('@user/application/use-cases/create', () => {
    const userId = '000000000000000000000001';
    const paymentId = '000000000000000000000002';

    let useCase: CreateUserUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockPaymentRepository: jest.Mocked<PaymentRepository>;
    let mockUserService: jest.Mocked<UserService>;

    const user = UserFixture.getEntity({
        id: userId,
        type: UserType.USER,
    });

    const payment = PaymentFixture.getEntity({
        id: paymentId,
    });

    const createUserDto: CreateUserDto = {
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        type: UserType.USER,
        paymentId: payment.id,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateUserUseCase,
                {
                    provide: UserRepository,
                    useValue: createMock<UserRepository>(),
                },
                {
                    provide: PaymentRepository,
                    useValue: createMock<PaymentRepository>(),
                },
                {
                    provide: UserService,
                    useValue: createMock<UserService>(),
                },
            ],
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        mockUserRepository = module.get(UserRepository);
        mockPaymentRepository = module.get(PaymentRepository);
        mockUserService = module.get(UserService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        let mockValidateSameEmailExists: jest.SpyInstance;
        let mockHash: jest.SpyInstance;
        let spyCreateNewUser: jest.SpyInstance;
        let mockValidatePaymentRecord: jest.SpyInstance;

        beforeEach(() => {
            mockValidateSameEmailExists = jest.spyOn(
                mockUserService,
                'validateSameEmailExists',
            ).mockResolvedValue();

            mockValidatePaymentRecord = jest.spyOn(
                useCase,
                'validatePaymentRecord',
            ).mockResolvedValue(payment);

            mockHash = jest.spyOn(
                HashService,
                'hash',
            ).mockResolvedValue('hashed_password');

            spyCreateNewUser = jest.spyOn(
                User,
                'createNewUser',
            );

            mockPaymentRepository.updateById.mockResolvedValue(payment);
            mockUserRepository.create.mockResolvedValue(user);
        });

        it('should create a new user when email does not exist', async () => {
            const result = await useCase.execute(createUserDto);

            expect(mockValidateSameEmailExists).toHaveBeenCalledWith(
                createUserDto.email,
            );

            expect(mockValidatePaymentRecord).toHaveBeenCalledWith(
                createUserDto.paymentId,
            );

            expect(mockHash).toHaveBeenCalledWith(createUserDto.password);

            const hashedPassword = await mockHash.mock.results[0].value;

            expect(spyCreateNewUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createUserDto.name,
                    email: createUserDto.email,
                    passwordHash: hashedPassword,
                    type: createUserDto.type,
                    paymentId: createUserDto.paymentId,
                }),
                payment.planType,
            );

            const createNewUserResult = spyCreateNewUser.mock.results[0].value;

            expect(mockPaymentRepository.updateById).toHaveBeenCalledWith(
                payment.id,
                {
                    status: PaymentStatus.USED,
                    usedAt: expect.any(Date) as Date,
                },
            );

            expect(mockUserRepository.create).toHaveBeenCalledWith(
                createNewUserResult,
            );

            expect(result).toEqual(user);
        });

        it('should handle ConflictException', async () => {
            mockValidateSameEmailExists.mockRejectedValue(
                new ConflictException(userErrors.EMAIL_ALREADY_EXISTS),
            );

            await expect(useCase.execute(createUserDto)).rejects.toThrow(
                new ConflictException(userErrors.EMAIL_ALREADY_EXISTS),
            );
        });

        it('should handle NotFoundException when payment record is not found', async () => {
            mockValidatePaymentRecord.mockRejectedValue(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );

            await expect(useCase.execute(createUserDto)).rejects.toThrow(
                new NotFoundException(paymentErrors.PAYMENT_NOT_FOUND),
            );
        });

        it('should handle BadRequestException when payment record is not available', async () => {
            mockValidatePaymentRecord.mockRejectedValue(
                new BadRequestException(paymentErrors.PAYMENT_MUST_BE_VERIFIED),
            );

            await expect(useCase.execute(createUserDto)).rejects.toThrow(
                new BadRequestException(paymentErrors.PAYMENT_MUST_BE_VERIFIED),
            );
        });

        it('should handle unexpected error', async () => {
            mockValidateSameEmailExists.mockRejectedValue(
                new Error('Unexpected error'),
            );

            await expect(useCase.execute(createUserDto)).rejects.toThrow(
                new InternalServerErrorException(
                    new Error('Unexpected error'),
                ),
            );
        });
    });
});
