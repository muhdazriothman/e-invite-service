import {
    CelebratedPersonType,
    InvitationType,
    RelationshipType,
} from '@invitation/domain/entities/invitation';
import { UpdateInvitationDto } from '@invitation/interfaces/http/dtos/update';
import { PaymentFixture } from '@test/fixture/payment';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('@invitation/interfaces/http/dtos/update', () => {
    describe('#validation', () => {
        it('should pass validation with empty object', async () => {
            const dto = plainToClass(UpdateInvitationDto, {});
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with partial data', async () => {
            const dto = plainToClass(UpdateInvitationDto, {
                title: 'Updated Wedding Celebration',
                type: InvitationType.WEDDING,
            });
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with complete data', async () => {
            const dto = PaymentFixture.getUpdateDto();
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        describe('type', () => {
            it('should pass validation when type is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when type is a valid enum value', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    type: InvitationType.WEDDING,
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when type is not a valid enum value', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    type: 'invalid',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('type', 'isEnum');
            });
        });

        describe('title', () => {
            it('should pass validation when title is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when title is provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    title: 'Updated Title',
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when title is not a string', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    title: 123,
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('title', 'isString');
            });
        });

        describe('hosts', () => {
            it('should pass validation when hosts is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when hosts array is provided with valid data', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    hosts: [
                        {
                            name: 'John Doe',
                            title: 'Father of the Bride',
                            relationshipWithCelebratedPerson: RelationshipType.PARENT,
                            phoneNumber: '+1234567890',
                            email: 'john@example.com',
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when hosts array is empty', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    hosts: [],
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('hosts', 'arrayMinSize');
            });

            it('should fail validation when host name is not a string', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    hosts: [
                        {
                            name: 123,
                            title: 'Father of the Bride',
                            relationshipWithCelebratedPerson: RelationshipType.PARENT,
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveNestedValidationError('hosts', 'name', 'isString');
            });
        });

        describe('celebratedPersons', () => {
            it('should pass validation when celebratedPersons is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when celebratedPersons array is provided with valid data', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    celebratedPersons: [
                        {
                            name: 'Jane Doe',
                            title: 'Bride',
                            relationshipWithHost: RelationshipType.CHILD,
                            celebrationDate: '2024-06-15T00:00:00.000Z',
                            type: CelebratedPersonType.BRIDE,
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when celebratedPersons array is empty', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    celebratedPersons: [],
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError(
                    'celebratedPersons',
                    'arrayMinSize',
                );
            });

            it('should fail validation when celebrated person name is not a string', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    celebratedPersons: [
                        {
                            name: 123,
                            title: 'Bride',
                            relationshipWithHost: RelationshipType.CHILD,
                            celebrationDate: '2024-06-15T00:00:00.000Z',
                            type: CelebratedPersonType.BRIDE,
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveNestedValidationError(
                    'celebratedPersons',
                    'name',
                    'isString',
                );
            });
        });

        describe('date', () => {
            it('should pass validation when date is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when date is provided with valid data', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    date: {
                        gregorianDate: '2024-06-15T00:00:00.000Z',
                        hijriDate: '1445-12-08',
                    },
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when gregorianDate is not a valid date string', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    date: {
                        gregorianDate: 'invalid-date',
                        hijriDate: '1445-12-08',
                    },
                });
                const errors = await validate(dto);
                expect(errors).toHaveNestedValidationError(
                    'date',
                    'gregorianDate',
                    'isDateString',
                    false,
                );
            });
        });

        describe('location', () => {
            it('should pass validation when location is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when location is provided with valid data', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    location: {
                        address: '123 Wedding Hall, Downtown City',
                        wazeLink: 'https://waze.com/ul/123456',
                        googleMapsLink: 'https://maps.google.com/?q=123+Wedding+Hall',
                    },
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when address is not a string', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    location: {
                        address: 123,
                        wazeLink: 'https://waze.com/ul/123456',
                        googleMapsLink: 'https://maps.google.com/?q=123+Wedding+Hall',
                    },
                });
                const errors = await validate(dto);
                expect(errors).toHaveNestedValidationError(
                    'location',
                    'address',
                    'isString',
                    false,
                );
            });
        });

        describe('itineraries', () => {
            it('should pass validation when itineraries is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when itineraries array is provided with valid data', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    itineraries: [
                        {
                            activities: ['Reception', 'Dinner', 'Dancing'],
                            startTime: '18:00',
                            endTime: '23:00',
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when itineraries array is empty', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    itineraries: [],
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('itineraries', 'arrayMinSize');
            });

            it('should fail validation when activities is not an array', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    itineraries: [
                        {
                            activities: 'not-an-array',
                            startTime: '18:00',
                            endTime: '23:00',
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveNestedValidationError(
                    'itineraries',
                    'activities',
                    'isArray',
                );
            });
        });

        describe('contactPersons', () => {
            it('should pass validation when contactPersons is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when contactPersons array is provided with valid data', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    contactPersons: [
                        {
                            name: 'Event Coordinator',
                            title: 'Wedding Coordinator',
                            relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                            phoneNumber: '+1234567892',
                            whatsappNumber: '+1234567893',
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when contactPersons array is empty', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    contactPersons: [],
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('contactPersons', 'arrayMinSize');
            });

            it('should fail validation when contact person name is not a string', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    contactPersons: [
                        {
                            name: 123,
                            title: 'Wedding Coordinator',
                            relationshipWithCelebratedPerson: RelationshipType.FRIEND,
                        },
                    ],
                });
                const errors = await validate(dto);
                expect(errors).toHaveNestedValidationError(
                    'contactPersons',
                    'name',
                    'isString',
                );
            });
        });

        describe('rsvpDueDate', () => {
            it('should pass validation when rsvpDueDate is not provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {});
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should pass validation when rsvpDueDate is provided', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    rsvpDueDate: '2024-06-01T00:00:00.000Z',
                });
                const errors = await validate(dto);
                expect(errors).toHaveLength(0);
            });

            it('should fail validation when rsvpDueDate is not a valid date string', async () => {
                const dto = plainToClass(UpdateInvitationDto, {
                    rsvpDueDate: 'invalid-date',
                });
                const errors = await validate(dto);
                expect(errors).toHaveValidationError('rsvpDueDate', 'isDateString');
            });
        });
    });
});
