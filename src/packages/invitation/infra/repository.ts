import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    InvitationMongoDocument,
    InvitationMongoModelName,
    InvitationDocumentSchema,
} from '@invitation/infra/schema';
import { Invitation } from '@invitation/domain/entities/invitation';
import { PaginationResult } from '@common/domain/value-objects/pagination-result';

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

    async findAllWithPagination(
        userId?: string,
        next?: string,
        previous?: string,
        limit: number = 20
    ): Promise<PaginationResult<Invitation>> {
        const filter: {
            isDeleted: boolean;
            userId?: string;
            _id?: { $gt?: string; $lt?: string };
        } = {
            isDeleted: false,
        };

        if (userId) {
            filter.userId = userId;
        }

        let sortDirection: 1 | -1 = 1; // 1 for ascending (forward), -1 for descending (backward)
        let hasNextPage = false;
        let hasPreviousPage = false;

        // Handle cursor filtering
        if (next) {
            // Forward pagination
            if (/^[0-9a-fA-F]{24}$/.test(next)) {
                filter._id = { $gt: next };
            } else {
                console.warn('Invalid next cursor format provided:', next);
            }
        } else if (previous) {
            // Backward pagination
            sortDirection = -1;
            if (/^[0-9a-fA-F]{24}$/.test(previous)) {
                filter._id = { $lt: previous };
            } else {
                console.warn('Invalid previous cursor format provided:', previous);
            }
        }

        // Fetch one extra item to determine if there are more pages
        const documents = await this.invitationModel
            .find(filter)
            .sort({ _id: sortDirection })
            .limit(limit + 1)
            .lean();

        if (sortDirection === 1) {
            // Forward pagination
            hasNextPage = documents.length > limit;
            const data = documents.slice(0, limit).map(document =>
                InvitationRepository.toDomain(document)
            );

            let nextCursor: string | undefined;
            let previousCursor: string | undefined;

            if (hasNextPage && data.length > 0) {
                const lastItem = data[data.length - 1];
                nextCursor = lastItem.id;
            }

            if (data.length > 0) {
                const firstItem = data[0];
                previousCursor = firstItem.id;
            }

            // Check if there's a previous page by querying backwards from the first item
            if (data.length > 0) {
                const previousPageCheck = await this.invitationModel
                    .find({
                        ...filter,
                        _id: { $lt: data[0].id }
                    })
                    .sort({ _id: -1 })
                    .limit(1)
                    .lean();

                hasPreviousPage = previousPageCheck.length > 0;
            }

            return PaginationResult.create(
                data,
                hasNextPage ? nextCursor : undefined,
                hasPreviousPage ? previousCursor : undefined,
                hasNextPage,
                hasPreviousPage
            );
        } else {
            // Backward pagination
            hasPreviousPage = documents.length > limit;
            const data = documents.slice(0, limit).map(document =>
                InvitationRepository.toDomain(document)
            );

            // Reverse the data to maintain chronological order
            const reversedData = data.reverse();

            let nextCursor: string | undefined;
            let previousCursor: string | undefined;

            if (hasPreviousPage && reversedData.length > 0) {
                const firstItem = reversedData[0];
                previousCursor = firstItem.id;
            }

            if (reversedData.length > 0) {
                const lastItem = reversedData[reversedData.length - 1];
                nextCursor = lastItem.id;
            }

            // Check if there's a next page by querying forwards from the last item
            if (reversedData.length > 0) {
                const nextPageCheck = await this.invitationModel
                    .find({
                        ...filter,
                        _id: { $gt: reversedData[reversedData.length - 1].id }
                    })
                    .sort({ _id: 1 })
                    .limit(1)
                    .lean();

                hasNextPage = nextPageCheck.length > 0;
            }

            return PaginationResult.create(
                reversedData,
                hasNextPage ? nextCursor : undefined,
                hasPreviousPage ? previousCursor : undefined,
                hasNextPage,
                hasPreviousPage
            );
        }
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
