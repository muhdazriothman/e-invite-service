import { NotFoundException } from '@nestjs/common';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PlanType,
} from '@payment/domain/entities/payment';
import { PaymentRepository } from '@payment/infra/repository';
import { PaymentFixture } from '@test/fixture/payment';

import { DeletePaymentUseCase } from './delete';

describe('@payment/application/use-cases/delete', () => {
  let useCase: DeletePaymentUseCase;
  let paymentRepository: jest.Mocked<PaymentRepository>;

  beforeEach(async() => {
    const mockPaymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByReference: jest.fn(),
      findAll: jest.fn(),
      findAvailableForUserCreation: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePaymentUseCase,
        {
          provide: 'PaymentRepository',
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeletePaymentUseCase>(DeletePaymentUseCase);
    paymentRepository = module.get('PaymentRepository');
  });

  describe('#execute', () => {
    it('should delete payment when found', async() => {
      const paymentId = 'payment-123';
      const mockPayment = PaymentFixture.getEntity({
        id: paymentId,
        currency: 'USD',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        reference: 'PAY-001',
        description: 'Basic plan payment',
        planType: PlanType.BASIC,
        createdBy: 'admin-123',
      });

      paymentRepository.findById.mockResolvedValue(mockPayment);
      paymentRepository.delete.mockResolvedValue(true);

      await useCase.execute(paymentId);

      expect(paymentRepository.findById).toHaveBeenCalledWith(paymentId);
      expect(paymentRepository.delete).toHaveBeenCalledWith(paymentId);
    });

    it('should throw NotFoundException when payment not found', async() => {
      const paymentId = 'non-existent';

      paymentRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(paymentId)).rejects.toThrow(
        NotFoundException,
      );

      expect(paymentRepository.findById).toHaveBeenCalledWith(paymentId);
      expect(paymentRepository.delete).not.toHaveBeenCalled();
    });
  });
});
