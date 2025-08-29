import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    InvitationMongoDocument,
    InvitationMongoModelName,
    InvitationDocumentSchema,
} from '@invitation/infra/schema';
import { Invitation } from '@invitation/domain/entities/invitation';

@Injectable()
export class InvitationRepository {
    constructor(
        @InjectModel(InvitationMongoModelName)
        private readonly invitationModel: Model<InvitationMongoDocument>,
    ) { }

    static getCollectionName(): string {
        return 'invitations';
    }

    static toDomain(doc: InvitationDocumentSchema): Invitation {
        return Invitation.createFromDb({
            id: (doc._id as unknown)?.toString() ?? '',
            userId: doc.userId,
            type: doc.type,
            title: doc.title,
            hosts: doc.hosts,
            celebratedPersons: doc.celebratedPersons,
            date: doc.date,
            location: doc.location,
            itineraries: doc.itineraries,
            contactPersons: doc.contactPersons,
            rsvpDueDate: doc.rsvpDueDate,
            isDeleted: doc.isDeleted ?? false,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            deletedAt: doc.deletedAt ?? null,
        });
    }

    async create(invitation: Invitation): Promise<Invitation> {
        const createdInvitation = await this.invitationModel.create({
            userId: invitation.userId,
            type: invitation.type,
            title: invitation.title,
            hosts: invitation.hosts,
            celebratedPersons: invitation.celebratedPersons,
            date: invitation.date,
            location: invitation.location,
            itineraries: invitation.itineraries,
            contactPersons: invitation.contactPersons,
            rsvpDueDate: invitation.rsvpDueDate,
            isDeleted: invitation.isDeleted,
            deletedAt: invitation.deletedAt,
        });

        const document = createdInvitation.toObject();
        return InvitationRepository.toDomain(document);
    }

    async findAll(userId?: string): Promise<Invitation[]> {
        const filter: {
            isDeleted: boolean;
            userId?: string;
        } = {
            isDeleted: false,
        };

        if (userId) {
            filter.userId = userId;
        }

        const documents = await this.invitationModel
            .find(filter)
            .lean();

        return documents.map(document =>
            InvitationRepository.toDomain(document)
        );
    }

    async findById(id: string, userId?: string): Promise<Invitation | null> {
        const filter: {
            _id: string;
            isDeleted: boolean;
            userId?: string;
        } = {
            _id: id,
            isDeleted: false,
        };

        if (userId) {
            filter.userId = userId;
        }

        const document = await this.invitationModel
            .findOne(filter)
            .lean();

        if (!document) {
            return null;
        }

        return InvitationRepository.toDomain(document);
    }

    async findByUserId(userId: string): Promise<Invitation[]> {
        const documents = await this.invitationModel
            .find({
                userId,
                isDeleted: false
            })
            .lean();

        return documents.map(document =>
            InvitationRepository.toDomain(document)
        );
    }

    async countByUserId(userId: string): Promise<number> {
        return await this.invitationModel.countDocuments({
            userId,
            isDeleted: false
        });
    }

    async update(id: string, invitationData: Partial<Invitation>, userId?: string): Promise<Invitation | null> {
        const filter: {
            _id: string;
            isDeleted: boolean;
            userId?: string;
        } = {
            _id: id,
            isDeleted: false,
        };

        if (userId) {
            filter.userId = userId;
        }

        const updateData = {
            ...invitationData,
            updatedAt: new Date(),
        };

        const document = await this.invitationModel.findOneAndUpdate(
            filter,
            updateData,
            {
                new: true,
                lean: true
            }
        );

        if (!document) {
            return null;
        }

        return InvitationRepository.toDomain(document);
    }

    async delete(id: string, userId?: string): Promise<boolean> {
        const filter: {
            _id: string;
            isDeleted: { $ne: boolean };
            userId?: string;
        } = {
            _id: id,
            isDeleted: {
                $ne: true
            }
        };

        if (userId) {
            filter.userId = userId;
        }

        const result = await this.invitationModel.updateOne(
            filter,
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            }
        );

        return result.modifiedCount > 0;
    }
}
