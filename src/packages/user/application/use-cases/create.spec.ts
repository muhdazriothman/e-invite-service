import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create';
import { UserRepository } from '@user/infra/repository';
import { UserType } from '@user/domain/entities/user';
import { PlanType, PaymentStatus } from '@payment/domain/entities/payment';
import { HashService } from '@shared/services/hash';
import { UserFixture } from '@test/fixture/user';
import { PaymentFixture } from '@test/fixture/payment';
import { CreateUserDto } from '@user/interfaces/http/dtos/create';
import { PaymentRepository } from '@payment/infra/repository';

describe('@user/application/use-cases/create', () => {
    let useCase: CreateUserUseCase;
    let userRepository: jest.Mocked<UserRepository>;
    let paymentRepository: jest.Mocked<PaymentRepository>;
    let hashService: jest.Mocked<HashService>;

    const user = UserFixture.getEntity({
        id: '1',
        name: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        type: UserType.USER,
    });

    const payment = PaymentFixture.getEntity({
        id: 'payment-id-123',
        planType: PlanType.BASIC,
        status: PaymentStatus.VERIFIED,
        isDeleted: false,
    });

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findByEmail: jest.fn(),
            delete: jest.fn(),
        };

        const mockPaymentRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByReference: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const mockHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateUserUseCase,
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: 'PaymentRepository',
                    useValue: mockPaymentRepository,
                },
                {
                    provide: 'HashService',
                    useValue: mockHashService,
                },
            ],
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        userRepository = module.get('UserRepository');
        paymentRepository = module.get('PaymentRepository');
        hashService = module.get('HashService');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const createUserDto: CreateUserDto = {
            name: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.USER,
            paymentId: 'payment-id-123',
        };

        it('should create a new user when email does not exist', async () => {
            const hashedPassword = 'hashedPassword123';

            userRepository.findByEmail.mockResolvedValue(null);
            paymentRepository.findById.mockResolvedValue(payment);
            paymentRepository.update.mockResolvedValue(payment);
            userRepository.create.mockResolvedValue(user);
            hashService.hash.mockResolvedValue(hashedPassword);

            const result = await useCase.execute(createUserDto);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(paymentRepository.findById).toHaveBeenCalledWith(createUserDto.paymentId);
            expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: createUserDto.name,
                    email: createUserDto.email,
                    passwordHash: hashedPassword,
                    type: createUserDto.type,
                })
            );
            expect(result).toEqual(user);
        });

        it('should create user with correct capabilities based on plan type', async () => {
            const premiumPayment = PaymentFixture.getEntity({
                id: 'payment-id-123',
                planType: PlanType.PREMIUM,
                status: PaymentStatus.VERIFIED,
                isDeleted: false,
            });

            const hashedPassword = 'hashedPassword123';

            userRepository.findByEmail.mockResolvedValue(null);
            paymentRepository.findById.mockResolvedValue(premiumPayment);
            paymentRepository.update.mockResolvedValue(premiumPayment);
            userRepository.create.mockResolvedValue(user);
            hashService.hash.mockResolvedValue(hashedPassword);

            await useCase.execute(createUserDto);

            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    capabilities: {
                        invitationLimit: 3, // Premium plan limit
                    },
                })
            );
        });

        it('should mark payment record as used after successful user creation', async () => {
            const hashedPassword = 'hashedPassword123';
            const freshPayment = PaymentFixture.getEntity({
                id: 'payment-id-123',
                planType: PlanType.BASIC,
                status: PaymentStatus.VERIFIED,
                isDeleted: false,
            });

            userRepository.findByEmail.mockResolvedValue(null);
            paymentRepository.findById.mockResolvedValue(freshPayment);
            paymentRepository.update.mockResolvedValue(freshPayment);
            userRepository.create.mockResolvedValue(user);
            hashService.hash.mockResolvedValue(hashedPassword);

            await useCase.execute(createUserDto);

            expect(paymentRepository.update).toHaveBeenCalledWith(
                'payment-id-123',
                {
                    status: PaymentStatus.USED,
                    usedAt: expect.any(Date),
                }
            );
        });

        it('should throw ConflictException when email already exists', async () => {
            const existingUser = UserFixture.getEntity({
                id: '1',
                name: 'existinguser',
                email: createUserDto.email,
                passwordHash: 'existingHash',
                type: UserType.USER,
            });

            userRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(useCase.execute(createUserDto)).rejects.toThrow(ConflictException);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(userRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when payment record is not found', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            paymentRepository.findById.mockResolvedValue(null);

            await expect(useCase.execute(createUserDto)).rejects.toThrow('Payment record not found');
            expect(paymentRepository.findById).toHaveBeenCalledWith(createUserDto.paymentId);
            expect(userRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when payment record is not verified', async () => {
            const pendingPayment = PaymentFixture.getEntity({
                id: 'payment-id-123',
                planType: PlanType.BASIC,
                status: PaymentStatus.PENDING,
                isDeleted: false,
            });

            userRepository.findByEmail.mockResolvedValue(null);
            paymentRepository.findById.mockResolvedValue(pendingPayment);

            await expect(useCase.execute(createUserDto)).rejects.toThrow('Payment record is not available for user creation');
            expect(paymentRepository.findById).toHaveBeenCalledWith(createUserDto.paymentId);
            expect(userRepository.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when payment record is deleted', async () => {
            const deletedPayment = PaymentFixture.getEntity({
                id: 'payment-id-123',
                planType: PlanType.BASIC,
                status: PaymentStatus.VERIFIED,
                isDeleted: true,
            });

            userRepository.findByEmail.mockResolvedValue(null);
            paymentRepository.findById.mockResolvedValue(deletedPayment);

            await expect(useCase.execute(createUserDto)).rejects.toThrow('Payment record is not available for user creation');
            expect(paymentRepository.findById).toHaveBeenCalledWith(createUserDto.paymentId);
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });
});

