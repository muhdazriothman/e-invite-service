import {
  CelebratedPersonType,
  RelationshipType,
} from '@invitation/domain/entities/invitation';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import { InvitationFixture } from '@test/fixture/invitation';
import { validate } from 'class-validator';

describe('@invitation/interfaces/http/dtos/create', () => {
  let createInvitationDto: CreateInvitationDto;

  beforeEach(() => {
    createInvitationDto = InvitationFixture.getCreateInvitationDto();
  });

  describe('#validation', () => {
    it('should pass validation with valid data', async() => {
      const errors = await validate(createInvitationDto);
      expect(errors).toHaveLength(0);
    });

    describe('type', () => {
      it('should fail validation when type is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.type;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveValidationError('type');
      });

      it('should fail validation when type is not a valid enum value', async() => {
        // @ts-expect-error - we want to test the validation
        createInvitationDto.type = 'invalid';

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveValidationError('type', 'isEnum');
      });
    });

    describe('title', () => {
      it('should fail validation when title is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.title;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveValidationError('title');
      });

      it('should fail validation when title is not a string', async() => {
        // @ts-expect-error - we want to test the validation
        createInvitationDto.title = 123;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveValidationError('title', 'isString');
      });
    });

    describe('hosts', () => {
      it('should fail validation when hosts is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.hosts;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveValidationError('hosts');
      });

      it('should fail validation when hosts array is empty', async() => {
        createInvitationDto.hosts = [];

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveValidationError('hosts', 'arrayMinSize');
      });

      describe('name', () => {
        it('should fail validation when name is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.hosts[0].name;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError('hosts', 'name');
        });

        it('should fail validation when name is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.hosts[0].name = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'hosts',
            'name',
            'isString',
          );
        });
      });

      describe('title', () => {
        it('should fail validation when title is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.hosts[0].title;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError('hosts', 'title');
        });

        it('should fail validation when title is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.hosts[0].title = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'hosts',
            'title',
            'isString',
          );
        });
      });

      describe('relationshipWithCelebratedPerson', () => {
        const validRelationshipWithCelebratedPerson = [
          RelationshipType.PARENT,
          RelationshipType.CHILD,
          RelationshipType.SIBLING,
          RelationshipType.SPOUSE,
          RelationshipType.FRIEND,
          RelationshipType.RELATIVE,
          RelationshipType.COLLEAGUE,
          RelationshipType.NEIGHBOUR,
        ];

        for (const relationshipWithCelebratedPerson of validRelationshipWithCelebratedPerson) {
          it(`should pass validation when relationshipWithCelebratedPerson is ${relationshipWithCelebratedPerson}`, async() => {
            createInvitationDto.hosts[0].relationshipWithCelebratedPerson =
              relationshipWithCelebratedPerson;

            const errors = await validate(createInvitationDto);
            expect(errors).toHaveLength(0);
          });
        }

        it('should fail validation when relationshipWithCelebratedPerson is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.hosts[0].relationshipWithCelebratedPerson;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'hosts',
            'relationshipWithCelebratedPerson',
          );
        });

        it('should fail validation when relationshipWithCelebratedPerson is not a valid enum value', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.hosts[0].relationshipWithCelebratedPerson =
            'invalid';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'hosts',
            'relationshipWithCelebratedPerson',
            'isEnum',
          );
        });
      });

      describe('phoneNumber', () => {
        it('should pass validation when phoneNumber is provided', async() => {
          createInvitationDto.hosts[0].phoneNumber = '+1234567890';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should pass validation when phoneNumber is not provided', async() => {
          delete createInvitationDto.hosts[0].phoneNumber;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should fail validation when phoneNumber is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.hosts[0].phoneNumber = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'hosts',
            'phoneNumber',
            'isString',
          );
        });
      });

      describe('email', () => {
        it('should pass validation when email is provided', async() => {
          createInvitationDto.hosts[0].email = 'test@example.com';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should pass validation when email is not provided', async() => {
          delete createInvitationDto.hosts[0].email;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should fail validation when email is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.hosts[0].email = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'hosts',
            'email',
            'isString',
          );
        });
      });
    });

    describe('celebratedPersons', () => {
      it('should fail validation when celebratedPersons is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.celebratedPersons;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('celebratedPersons');
      });

      it('should fail validation when celebratedPersons array is empty', async() => {
        createInvitationDto.celebratedPersons = [];

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('celebratedPersons');
      });

      describe('name', () => {
        it('should fail validation when name is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.celebratedPersons[0].name;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'name',
          );
        });

        it('should fail validation when name is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.celebratedPersons[0].name = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'name',
            'isString',
          );
        });
      });

      describe('title', () => {
        it('should fail validation when title is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.celebratedPersons[0].title;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'title',
          );
        });

        it('should fail validation when title is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.celebratedPersons[0].title = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'title',
            'isString',
          );
        });
      });

      describe('relationshipWithHost', () => {
        const validRelationshipWithHost = [
          RelationshipType.PARENT,
          RelationshipType.CHILD,
          RelationshipType.SIBLING,
          RelationshipType.SPOUSE,
          RelationshipType.FRIEND,
          RelationshipType.RELATIVE,
          RelationshipType.COLLEAGUE,
          RelationshipType.NEIGHBOUR,
        ];

        for (const relationshipWithHost of validRelationshipWithHost) {
          it(`should pass validation when relationshipWithHost is ${relationshipWithHost}`, async() => {
            createInvitationDto.celebratedPersons[0].relationshipWithHost =
              relationshipWithHost;

            const errors = await validate(createInvitationDto);
            expect(errors).toHaveLength(0);
          });
        }

        it('should fail validation when relationshipWithHost is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.celebratedPersons[0].relationshipWithHost;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'relationshipWithHost',
          );
        });

        it('should fail validation when relationshipWithHost is not a valid enum value', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.celebratedPersons[0].relationshipWithHost =
            'invalid';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'relationshipWithHost',
            'isEnum',
          );
        });
      });

      describe('celebrationDate', () => {
        it('should fail validation when celebrationDate is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.celebratedPersons[0].celebrationDate;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'celebrationDate',
          );
        });

        it('should fail validation when celebrationDate is not a valid date string', async() => {
          createInvitationDto.celebratedPersons[0].celebrationDate =
            'invalid-date';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'celebrationDate',
            'isDateString',
          );
        });
      });

      describe('type', () => {
        const validTypes = [
          CelebratedPersonType.GROOM,
          CelebratedPersonType.BRIDE,
          CelebratedPersonType.CHILD,
          CelebratedPersonType.PARENT,
          CelebratedPersonType.GRADUATE,
          CelebratedPersonType.HOME_OWNER,
          CelebratedPersonType.COUPLE,
          CelebratedPersonType.HONOREE,
          CelebratedPersonType.OTHER,
        ];

        for (const type of validTypes) {
          it(`should pass validation when type is ${type}`, async() => {
            createInvitationDto.celebratedPersons[0].type = type;

            const errors = await validate(createInvitationDto);
            expect(errors).toHaveLength(0);
          });
        }

        it('should fail validation when type is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.celebratedPersons[0].type;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'type',
          );
        });

        it('should fail validation when type is not a valid enum value', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.celebratedPersons[0].type = 'invalid';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'celebratedPersons',
            'type',
            'isEnum',
          );
        });
      });
    });

    describe('date', () => {
      it('should fail validation when date is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.date;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('date');
      });

      describe('gregorianDate', () => {
        it('should fail validation when gregorianDate is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.date.gregorianDate;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'date',
            'gregorianDate',
            undefined,
            false,
          );
        });

        it('should fail validation when gregorianDate is not a valid date string', async() => {
          createInvitationDto.date.gregorianDate = 'invalid-date';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'date',
            'gregorianDate',
            'isDateString',
            false,
          );
        });
      });

      describe('hijriDate', () => {
        it('should pass validation when hijriDate is provided', async() => {
          createInvitationDto.date.hijriDate = '1445-12-08';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should pass validation when hijriDate is not provided', async() => {
          delete createInvitationDto.date.hijriDate;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should fail validation when hijriDate is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.date.hijriDate = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'date',
            'hijriDate',
            'isString',
            false,
          );
        });
      });
    });

    describe('location', () => {
      it('should fail validation when location is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.location;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveValidationError('location');
      });

      describe('address', () => {
        it('should fail validation when address is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.location.address;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'location',
            'address',
            undefined,
            false,
          );
        });

        it('should fail validation when address is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.location.address = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'location',
            'address',
            'isString',
            false,
          );
        });
      });

      describe('wazeLink', () => {
        it('should pass validation when wazeLink is provided', async() => {
          createInvitationDto.location.wazeLink = 'https://waze.com/ul/123456';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should pass validation when wazeLink is not provided', async() => {
          delete createInvitationDto.location.wazeLink;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should fail validation when wazeLink is not a valid URL', async() => {
          createInvitationDto.location.wazeLink = 'invalid-url';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'location',
            'wazeLink',
            'isUrl',
            false,
          );
        });
      });

      describe('googleMapsLink', () => {
        it('should pass validation when googleMapsLink is provided', async() => {
          createInvitationDto.location.googleMapsLink =
            'https://maps.google.com/?q=123+Wedding+Hall';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should pass validation when googleMapsLink is not provided', async() => {
          delete createInvitationDto.location.googleMapsLink;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should fail validation when googleMapsLink is not a valid URL', async() => {
          createInvitationDto.location.googleMapsLink = 'invalid-url';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'location',
            'googleMapsLink',
            'isUrl',
            false,
          );
        });
      });
    });

    describe('itineraries', () => {
      it('should fail validation when itineraries is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.itineraries;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('itineraries');
      });

      it('should fail validation when itineraries array is empty', async() => {
        createInvitationDto.itineraries = [];

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('itineraries');
      });

      describe('activities', () => {
        it('should fail validation when activities is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.itineraries[0].activities;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'itineraries',
            'activities',
          );
        });

        it('should fail validation when activities is not an array', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.itineraries[0].activities = 'not-an-array';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'itineraries',
            'activities',
            'isArray',
          );
        });

        it('should fail validation when activities array contains non-string values', async() => {
          createInvitationDto.itineraries[0].activities = [
            'valid',
            // @ts-expect-error - we want to test the validation with invalid type
            123,
            'also-valid',
          ];

          const errors = await validate(createInvitationDto);

          expect(errors).toHaveNestedValidationError(
            'itineraries',
            'activities',
            'isString',
          );
        });
      });

      describe('startTime', () => {
        it('should fail validation when startTime is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.itineraries[0].startTime;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'itineraries',
            'startTime',
          );
        });

        it('should fail validation when startTime is not a valid time string', async() => {
          createInvitationDto.itineraries[0].startTime = 'invalid-time';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'itineraries',
            'startTime',
            'matches',
          );
        });
      });

      describe('endTime', () => {
        it('should fail validation when endTime is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.itineraries[0].endTime;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError('itineraries', 'endTime');
        });

        it('should fail validation when endTime is not a valid time string', async() => {
          createInvitationDto.itineraries[0].endTime = 'invalid-time';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'itineraries',
            'endTime',
            'matches',
          );
        });
      });
    });

    describe('contactPersons', () => {
      it('should fail validation when contactPersons is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.contactPersons;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('contactPersons');
      });

      it('should fail validation when contactPersons array is empty', async() => {
        createInvitationDto.contactPersons = [];

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('contactPersons');
      });

      describe('name', () => {
        it('should fail validation when name is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.contactPersons[0].name;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError('contactPersons', 'name');
        });

        it('should fail validation when name is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.contactPersons[0].name = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'contactPersons',
            'name',
            'isString',
          );
        });
      });

      describe('title', () => {
        it('should fail validation when title is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.contactPersons[0].title;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError('contactPersons', 'title');
        });

        it('should fail validation when title is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.contactPersons[0].title = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'contactPersons',
            'title',
            'isString',
          );
        });
      });

      describe('relationshipWithCelebratedPerson', () => {
        const validRelationshipWithCelebratedPerson = [
          RelationshipType.PARENT,
          RelationshipType.CHILD,
          RelationshipType.SIBLING,
          RelationshipType.SPOUSE,
          RelationshipType.FRIEND,
          RelationshipType.RELATIVE,
          RelationshipType.COLLEAGUE,
          RelationshipType.NEIGHBOUR,
        ];

        for (const relationshipWithCelebratedPerson of validRelationshipWithCelebratedPerson) {
          it(`should pass validation when relationshipWithCelebratedPerson is ${relationshipWithCelebratedPerson}`, async() => {
            createInvitationDto.contactPersons[0].relationshipWithCelebratedPerson =
              relationshipWithCelebratedPerson;

            const errors = await validate(createInvitationDto);
            expect(errors).toHaveLength(0);
          });
        }

        it('should fail validation when relationshipWithCelebratedPerson is not provided', async() => {
          // @ts-expect-error - we want to test the validation
          delete createInvitationDto.contactPersons[0]
            .relationshipWithCelebratedPerson;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'contactPersons',
            'relationshipWithCelebratedPerson',
          );
        });

        it('should fail validation when relationshipWithCelebratedPerson is not a valid enum value', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.contactPersons[0].relationshipWithCelebratedPerson =
            'invalid';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'contactPersons',
            'relationshipWithCelebratedPerson',
            'isEnum',
          );
        });
      });

      describe('phoneNumber', () => {
        it('should pass validation when phoneNumber is provided', async() => {
          createInvitationDto.contactPersons[0].phoneNumber = '+1234567890';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should pass validation when phoneNumber is not provided', async() => {
          delete createInvitationDto.contactPersons[0].phoneNumber;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should fail validation when phoneNumber is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.contactPersons[0].phoneNumber = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'contactPersons',
            'phoneNumber',
            'isString',
          );
        });
      });

      describe('whatsappNumber', () => {
        it('should pass validation when whatsappNumber is provided', async() => {
          createInvitationDto.contactPersons[0].whatsappNumber = '+1234567890';

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should pass validation when whatsappNumber is not provided', async() => {
          delete createInvitationDto.contactPersons[0].whatsappNumber;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveLength(0);
        });

        it('should fail validation when whatsappNumber is not a string', async() => {
          // @ts-expect-error - we want to test the validation
          createInvitationDto.contactPersons[0].whatsappNumber = 123;

          const errors = await validate(createInvitationDto);
          expect(errors).toHaveNestedValidationError(
            'contactPersons',
            'whatsappNumber',
            'isString',
          );
        });
      });
    });

    describe('rsvpDueDate', () => {
      it('should fail validation when rsvpDueDate is not provided', async() => {
        // @ts-expect-error - we want to test the validation
        delete createInvitationDto.rsvpDueDate;

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('rsvpDueDate');
      });

      it('should fail validation when rsvpDueDate is not a valid date string', async() => {
        createInvitationDto.rsvpDueDate = 'invalid-date';

        const errors = await validate(createInvitationDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('rsvpDueDate');
      });
    });
  });
});
