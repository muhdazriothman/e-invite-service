import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Payment,
    PaymentProps,
} from '@payment/domain/entities/payment';
import {
    PaymentMongoDocument,
    PaymentMongoModelName,
    PaymentDocumentSchema,
} from '@payment/infra/schema';
import { Model } from 'mongoose';

@Injectable()
export class PaymentRepository {
    constructor(
    @InjectModel(PaymentMongoModelName)
    private readonly paymentModel: Model<PaymentMongoDocument>,
    ) {}

    static getCollectionName(): string {
        return 'payments';
    }

    static toDomain(doc: PaymentDocumentSchema): Payment {
        return Payment.createFromDb({
            id: doc._id?.toString() ?? '',
            amount: doc.amount,
            currency: doc.currency,
            paymentMethod: doc.paymentMethod,
            status: doc.status,
            reference: doc.reference,
            description: doc.description,
            planType: doc.planType,
            usedAt: doc.usedAt ?? null,
            createdBy: doc.createdBy,
            isDeleted: doc.isDeleted ?? false,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt ?? null,
        });
    }

    async create(payment: Payment): Promise<Payment> {
        const createdPayment = await this.paymentModel.create({
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            reference: payment.reference,
            description: payment.description,
            planType: payment.planType,
            usedAt: payment.usedAt,
            createdBy: payment.createdBy,
            isDeleted: payment.isDeleted,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            deletedAt: payment.deletedAt,
        });

        const document = createdPayment.toObject();
        return PaymentRepository.toDomain(document);
    }

    async findAll(): Promise<Payment[]> {
        const documents = await this.paymentModel
            .find({
                isDeleted: false,
            })
            .lean();

        return documents.map((document) => PaymentRepository.toDomain(document));
    }

    async findByReference(reference: string): Promise<Payment | null> {
        const document = await this.paymentModel
            .findOne({
                reference,
                isDeleted: false,
            })
            .lean();
        if (!document) {
            return null;
        }

        return PaymentRepository.toDomain(document);
    }

    async findById(id: string): Promise<Payment | null> {
        const document = await this.paymentModel
            .findOne({
                _id: id,
                isDeleted: false,
            })
            .lean();
        if (!document) {
            return null;
        }

        return PaymentRepository.toDomain(document);
    }

    async update(
        id: string,
        updates: Partial<Pick<PaymentProps, 'status' | 'usedAt'>>,
    ): Promise<Payment | null> {
        const updateData = {
            ...updates,
            updatedAt: new Date(),
        };

        const document = await this.paymentModel.findOneAndUpdate(
            {
                _id: id,
                isDeleted: false,
            },
            updateData,
            {
                new: true,
                lean: true,
            },
        );

        if (!document) {
            return null;
        }

        return PaymentRepository.toDomain(document);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.paymentModel.updateOne(
            {
                _id: id,
                isDeleted: false,
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
        );

        return result.modifiedCount > 0;
    }
}
