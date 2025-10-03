import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Payment,
    UpdatePaymentProps,
} from '@payment/domain/entities/payment';
import {
    PaymentHydrated,
    PaymentLean,
    PaymentMongoModelName,
} from '@payment/infra/schema';
import {
    Model,
    Types,
} from 'mongoose';

interface FindByFilter {
    isDeleted: boolean;
    referenceNumber?: string;
    _id?: string;
}

interface UpdateFilter {
    isDeleted?: boolean;
    _id: string;
}

interface DeleteFilter {
    isDeleted: {
        $ne: boolean
    };
    userId?: string;
    _id: string;
}

@Injectable()
export class PaymentRepository {
    constructor (
    @InjectModel(PaymentMongoModelName)
    private readonly paymentModel: Model<PaymentHydrated>,
    ) {}

    static getCollectionName (): string {
        return 'payments';
    }

    static toDomain (
        document: PaymentLean,
    ): Payment {
        return Payment.createFromDb({
            _id: document._id,
            amount: document.amount,
            currency: document.currency,
            paymentMethod: document.paymentMethod,
            status: document.status,
            referenceNumber: document.referenceNumber,
            description: document.description,
            planType: document.planType,
            usedAt: document.usedAt,
            createdBy: document.createdBy,
            isDeleted: document.isDeleted,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            deletedAt: document.deletedAt,
        });
    }

    static toDocument (
        payment: Payment,
        model: Model<PaymentHydrated>,
    ): PaymentHydrated {
        return new model({
            _id: new Types.ObjectId(),
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            referenceNumber: payment.referenceNumber,
            description: payment.description,
            planType: payment.planType,
            usedAt: payment.usedAt,
            createdBy: payment.createdBy,
            isDeleted: payment.isDeleted,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            deletedAt: payment.deletedAt,
        });
    }

    async create (
        payment: Payment,
    ): Promise<Payment> {
        const document = PaymentRepository.toDocument(
            payment,
            this.paymentModel,
        );

        const createdPayment = (await this.paymentModel.create(document))
            .toObject();

        return PaymentRepository.toDomain(createdPayment);
    }

    async findAll (): Promise<Payment[]> {
        const documents = await this.paymentModel
            .find({
                isDeleted: false,
            })
            .sort({
                createdAt: -1,
            })
            .lean<PaymentHydrated[]>();

        const payments: Payment[] = [];

        for (const document of documents) {
            payments.push(PaymentRepository.toDomain(document));
        }

        return payments;
    }

    async findByReferenceNumber (
        referenceNumber: string,
    ): Promise<Payment | null> {
        const document = await this._findByFilter({
            referenceNumber,
            isDeleted: false,
        });
        if (!document) {
            return null;
        }

        return document;
    }

    async findById (
        id: string,
    ): Promise<Payment | null> {
        const document = await this._findByFilter({
            _id: id,
            isDeleted: false,
        });
        if (!document) {
            return null;
        }

        return document;
    }

    async _findByFilter (
        filter: FindByFilter,
    ): Promise<Payment | null> {
        const document = await this.paymentModel
            .findOne(
                filter,
            )
            .lean<PaymentHydrated>();
        if (!document) {
            return null;
        }

        return PaymentRepository.toDomain(document);
    }

    async updateById (
        id: string,
        updates: UpdatePaymentProps,
    ): Promise<Payment | null> {
        return this._update(
            {
                _id: id,
                isDeleted: false,
            },
            updates,
        );
    }

    async _update (
        filter: UpdateFilter,
        updates: UpdatePaymentProps,
    ): Promise<Payment | null> {

        const updatesToApply: Partial<Payment> = {
            updatedAt: new Date(),
        };

        if (updates.amount !== undefined) {
            updatesToApply.amount = updates.amount;
        }

        if (updates.currency !== undefined) {
            updatesToApply.currency = updates.currency;
        }

        if (updates.paymentMethod !== undefined) {
            updatesToApply.paymentMethod = updates.paymentMethod;
        }

        if (updates.referenceNumber !== undefined) {
            updatesToApply.referenceNumber = updates.referenceNumber;
        }

        if (updates.description !== undefined) {
            updatesToApply.description = updates.description;
        }

        if (updates.status !== undefined) {
            updatesToApply.status = updates.status;
        }

        if (updates.planType !== undefined) {
            updatesToApply.planType = updates.planType;
        }

        if (updates.usedAt !== undefined) {
            updatesToApply.usedAt = updates.usedAt;
        }

        const document = await this.paymentModel
            .findOneAndUpdate(
                filter,
                updatesToApply,
                {
                    new: true,
                },
            )
            .lean<PaymentHydrated>();

        if (!document) {
            return null;
        }

        return PaymentRepository.toDomain(document);
    }

    async deleteById (
        id: string,
    ): Promise<boolean> {
        return this._delete({
            _id: id,
            isDeleted: {
                $ne: true,
            },
        });
    }

    async _delete (
        filter: DeleteFilter,
    ): Promise<boolean> {
        const result = await this.paymentModel.updateOne(
            filter,
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            });

        return result.modifiedCount > 0;
    }
}
