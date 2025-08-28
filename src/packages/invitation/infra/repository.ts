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

    async findAll(): Promise<Invitation[]> {
        const documents = await this.invitationModel
            .find({
                isDeleted: false
            })
            .lean();

        return documents.map(document =>
            InvitationRepository.toDomain(document)
        );
    }

    async findById(id: string): Promise<Invitation | null> {
        const document = await this.invitationModel
            .findOne({
                _id: id,
                isDeleted: false
            })
            .lean();

        if (!document) {
            return null;
        }

        return InvitationRepository.toDomain(document);
    }

    async update(id: string, invitationData: Partial<Invitation>): Promise<Invitation | null> {
        const updateData = {
            ...invitationData,
            updatedAt: new Date(),
        };

        const document = await this.invitationModel.findOneAndUpdate(
            {
                _id: id,
                isDeleted: false
            },
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

    async delete(id: string): Promise<boolean> {
        const result = await this.invitationModel.updateOne(
            {
                _id: id,
                isDeleted: {
                    $ne: true,
                },
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            }
        );

        return result.modifiedCount > 0;
    }
}
