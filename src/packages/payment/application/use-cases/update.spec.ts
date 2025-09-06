import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import {
  PaymentMethod,
  PaymentStatus,
  PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';
import { PaymentFixture } from '@test/fixture/payment';

import { UpdatePaymentUseCase } from './update';

describe('@payment/application/use-cases/update', () => {
  let useCase: UpdatePaymentUseCase;
  let paymentRepository: jest.Mocked<PaymentRepository>;

  beforeEach(async() => {
    const mockPaymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByReference: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePaymentUseCase,
        {
          provide: 'PaymentRepository',
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePaymentUseCase>(UpdatePaymentUseCase);
    paymentRepository = module.get('PaymentRepository');
  });

  describe('#execute', () => {
    it('should update payment status successfully', async() => {
      const paymentId = 'payment-123';
      const existingPayment = PaymentFixture.getEntity({
        id: paymentId,
        currency: 'USD',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        reference: 'PAY-001',
        description: 'Test payment',
        planType: PlanType.BASIC,
        createdBy: 'admin-123',
        status: PaymentStatus.PENDING,
      });

      const updatedPayment = PaymentFixture.getEntity({
        id: paymentId,
        status: PaymentStatus.VERIFIED,
      });

      const updateDto: UpdatePaymentDto = {
        status: PaymentStatus.VERIFIED,
      };

      paymentRepository.findById.mockResolvedValue(existingPayment);
      paymentRepository.update.mockResolvedValue(updatedPayment);

      const result = await useCase.execute(paymentId, updateDto);

      expect(paymentRepository.findById).toHaveBeenCalledWith(paymentId);
      expect(paymentRepository.update).toHaveBeenCalledWith(paymentId, {
        status: PaymentStatus.VERIFIED,
      });
      expect(result).toEqual(updatedPayment);
    });

    it('should throw NotFoundException when payment not found', async() => {
      const paymentId = 'non-existent';
      const updateDto: UpdatePaymentDto = {
        status: PaymentStatus.VERIFIED,
      };

      paymentRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(paymentId, updateDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(paymentRepository.findById).toHaveBeenCalledWith(paymentId);
      expect(paymentRepository.update).not.toHaveBeenCalled();
    });

    it('should mark payment as used when status is set to USED', async() => {
      const paymentId = 'payment-123';
      const existingPayment = PaymentFixture.getEntity({
        id: paymentId,
        currency: 'USD',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        reference: 'PAY-001',
        description: 'Test payment',
        planType: PlanType.BASIC,
        createdBy: 'admin-123',
        status: PaymentStatus.VERIFIED,
      });

      const updatedPayment = PaymentFixture.getEntity({
        id: paymentId,
        status: PaymentStatus.USED,
        usedAt: new Date(),
      });

      const updateDto: UpdatePaymentDto = {
        status: PaymentStatus.USED,
      };

      paymentRepository.findById.mockResolvedValue(existingPayment);
      paymentRepository.update.mockResolvedValue(updatedPayment);

      const result = await useCase.execute(paymentId, updateDto);

      expect(paymentRepository.update).toHaveBeenCalledWith(paymentId, {
        status: PaymentStatus.USED,
        usedAt: expect.any(Date),
      });
      expect(result).toEqual(updatedPayment);
    });

    it('should throw BadRequestException when trying to verify non-pending payment', async() => {
      const paymentId = 'payment-123';
      const existingPayment = PaymentFixture.getEntity({
        id: paymentId,
        currency: 'USD',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        reference: 'PAY-001',
        description: 'Test payment',
        planType: PlanType.BASIC,
        createdBy: 'admin-123',
        status: PaymentStatus.VERIFIED,
      });

      const updateDto: UpdatePaymentDto = {
        status: PaymentStatus.VERIFIED,
      };

      paymentRepository.findById.mockResolvedValue(existingPayment);

      await expect(useCase.execute(paymentId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
