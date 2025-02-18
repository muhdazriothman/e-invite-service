import { Invitation } from '../../../domain/entities/invitation';
import { InvitationFactory } from '../../../domain/factories/invitation';
import { InvitationModel, IInvitation } from './model';

interface Options {
    returnDeleted?: boolean;
}

export class InvitationRepository {
    static toDomain(document: IInvitation): Invitation {
        return InvitationFactory.create({
            id: document._id.toString(),
            type: document.type,
            title: document.title,
            hosts: document.hosts,
            celebratedPersons: document.celebratedPersons,
            date: document.date,
            location: document.location,
            itineraries: document.itineraries,
            contactPersons: document.contactPersons,
            rsvpDueDate: document.rsvpDueDate,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            deleted: document.deleted,
            deletedAt: document.deletedAt
        });
    }

    async create(data: Partial<Invitation>): Promise<Invitation> {
        const invitation = new InvitationModel(data);

        const document = await invitation.save();

        return InvitationRepository.toDomain(document);
    }

    async findAll(options: Options): Promise<Invitation[]> {
        const {
            returnDeleted = false
        } = options;

        const query: { deleted?: boolean } = {};

        if (!returnDeleted) {
            query.deleted = false;
        }

        const documents = await InvitationModel.find(query).exec();

        const invitations: Invitation[] = [];

        for (const document of documents) {
            invitations.push(InvitationRepository.toDomain(document));
        }

        return invitations;
    }

    async findById(id: string, options: Options): Promise<Invitation | null> {
        const {
            returnDeleted = false
        } = options;

        const query: { _id: string; deleted?: boolean } = {
            _id: id
        };

        if (!returnDeleted) {
            query.deleted = false;
        }

        const document = await InvitationModel.findOne(query).exec();

        if (!document) {
            return null;
        }

        return InvitationRepository.toDomain(document);
    }

    async findByEmail(email: string, options: Options): Promise<Invitation | null> {
        const {
            returnDeleted = false
        } = options;

        const query: { email: string; deleted?: boolean } = {
            email
        };

        if (!returnDeleted) {
            query.deleted = false;
        }

        const document = await InvitationModel.findOne(query).exec();

        if (!document) {
            return null;
        }

        return InvitationRepository.toDomain(document);
    }

    async delete(id: string): Promise<void> {
        await InvitationModel.findByIdAndUpdate(id, {
            deleted: true,
            deletedAt: new Date()
        }).exec();
    }
}
