import {
    Invitation,
    UpdateInvitationProps,
} from '@invitation/domain/entities/invitation';
import {
    InvitationHydrated,
    InvitationLean,
    InvitationMongoModelName,
} from '@invitation/infra/schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationResult } from '@shared/domain/value-objects/pagination-result';
import {
    Model,
    Types,
} from 'mongoose';

interface FindAllWithPaginationFilter {
    isDeleted: boolean;
    userId?: string;
    _id?: {
        $gt?: string;
        $lt?: string;
    };
}

interface FindByFilter {
    isDeleted: boolean;
    userId?: string;
    _id: string;
}

interface UpdateFilter {
    isDeleted?: boolean;
    userId?: string;
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
export class InvitationRepository {
    constructor(
    @InjectModel(InvitationMongoModelName)
    private readonly invitationModel: Model<InvitationHydrated>,
    ) {}

    static getCollectionName(): string {
        return 'invitations';
    }

    static toDomain(
        document: InvitationLean,
    ): Invitation {
        return Invitation.createFromDb({
            _id: document._id,
            userId: document.userId,
            type: document.type,
            title: document.title,
            hosts: document.hosts,
            celebratedPersons: document.celebratedPersons,
            date: document.date,
            location: document.location,
            itineraries: document.itineraries,
            contactPersons: document.contactPersons,
            rsvpDueDate: document.rsvpDueDate,
            isDeleted: document.isDeleted ?? false,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            deletedAt: document.deletedAt ?? null,
        });
    }

    static toDocument(
        invitation: Invitation,
        model: Model<InvitationHydrated>,
    ): InvitationHydrated {
        return new model({
            _id: new Types.ObjectId(),
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
            createdAt: invitation.createdAt,
            updatedAt: invitation.updatedAt,
            deletedAt: invitation.deletedAt,
        });
    }

    async create(invitation: Invitation): Promise<Invitation> {
        const document = InvitationRepository.toDocument(
            invitation,
            this.invitationModel,
        );

        const createdInvitation = (await this.invitationModel.create(document))
            .toObject();

        return InvitationRepository.toDomain(createdInvitation);
    }

    async findAllWithPagination(
        userId?: string,
        next?: string,
        previous?: string,
        limit: number = 20,
    ): Promise<PaginationResult<Invitation>> {
        const filter: FindAllWithPaginationFilter = {
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
            .lean<InvitationHydrated[]>();

        if (sortDirection === 1) {
            // Forward pagination
            hasNextPage = documents.length > limit;
            const data = documents
                .slice(0, limit)
                .map((document) => InvitationRepository.toDomain(document));

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
                        _id: { $lt: data[0].id },
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
                hasPreviousPage,
            );
        } else {
            // Backward pagination
            hasPreviousPage = documents.length > limit;
            const data = documents
                .slice(0, limit)
                .map((document) => InvitationRepository.toDomain(document));

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
                        _id: { $gt: reversedData[reversedData.length - 1].id },
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
                hasPreviousPage,
            );
        }
    }

    async findById(
        id: string,
    ): Promise<Invitation | null> {
        const document = await this._findByFilter({
            _id: id,
            isDeleted: false,
        });
        if (!document) {
            return null;
        }

        return document;
    }

    async findByIdAndUserId(
        id: string,
        userId: string,
    ): Promise<Invitation | null> {
        const document = await this._findByFilter({
            _id: id,
            userId,
            isDeleted: false,
        });
        if (!document) {
            return null;
        }

        return document;
    }

    async _findByFilter(
        filter: FindByFilter,
    ): Promise<Invitation | null> {
        const document = await this.invitationModel
            .findOne(
                filter,
            )
            .lean<InvitationHydrated>();
        if (!document) {
            return null;
        }

        return InvitationRepository.toDomain(document);
    }

    async countByUserId(userId: string): Promise<number> {
        return await this.invitationModel.countDocuments({
            userId,
            isDeleted: false,
        });
    }

    async updateById(
        id: string,
        updates: UpdateInvitationProps,
    ): Promise<Invitation | null> {
        return this._update(
            {
                _id: id,
                isDeleted: false,
            },
            updates,
        );
    }

    async updateByIdAndUserId(
        id: string,
        userId: string,
        updates: UpdateInvitationProps,
    ): Promise<Invitation | null> {
        return this._update(
            {
                _id: id,
                userId,
                isDeleted: false,
            },
            updates,
        );
    }

    async _update(
        filter: UpdateFilter,
        updates: UpdateInvitationProps,
    ): Promise<Invitation | null> {

        const updatesToApply: Partial<Invitation> = {
            updatedAt: new Date(),
        };

        if(updates.type !== undefined) {
            updatesToApply.type = updates.type;
        }

        if(updates.title !== undefined) {
            updatesToApply.title = updates.title;
        }

        // TODO: Support partial updates without replacing whole objects
        if(updates.hosts !== undefined) {
            updatesToApply.hosts = updates.hosts;
        }

        // TODO: Support partial updates without replacing whole objects
        if(updates.celebratedPersons !== undefined) {
            updatesToApply.celebratedPersons = updates.celebratedPersons;
        }

        // TODO: Support partial updates without replacing whole objects
        if(updates.date !== undefined) {
            updatesToApply.date = updates.date;
        }

        // TODO: Support partial updates without replacing whole objects
        if(updates.location !== undefined) {
            updatesToApply.location = updates.location;
        }

        // TODO: Support partial updates without replacing whole objects
        if(updates.itineraries !== undefined) {
            updatesToApply.itineraries = updates.itineraries;
        }

        // TODO: Support partial updates without replacing whole objects
        if(updates.contactPersons !== undefined) {
            updatesToApply.contactPersons = updates.contactPersons;
        }

        if(updates.rsvpDueDate !== undefined) {
            updatesToApply.rsvpDueDate = updates.rsvpDueDate;
        }

        console.log('updatesToApply', updatesToApply);

        const document = await this.invitationModel
            .findOneAndUpdate(
                filter,
                updatesToApply,
                {
                    new: true,
                },
            )
            .lean<InvitationHydrated>();

        if (!document) {
            return null;
        }

        return InvitationRepository.toDomain(document);
    }

    async deleteById(
        id: string,
    ): Promise<boolean> {
        const filter: DeleteFilter = {
            _id: id,
            isDeleted: {
                $ne: true,
            },
        };

        return this._delete(filter);
    }

    async deleteByIdAndUserId(
        id: string,
        userId: string,
    ): Promise<boolean> {
        const filter: DeleteFilter = {
            _id: id,
            userId,
            isDeleted: {
                $ne: true,
            },
        };

        return this._delete(filter);
    }

    async _delete(
        filter: DeleteFilter,
    ): Promise<boolean> {
        const result = await this.invitationModel.updateOne(
            filter,
            {
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date(),
            });

        return result.modifiedCount > 0;
    }
}
