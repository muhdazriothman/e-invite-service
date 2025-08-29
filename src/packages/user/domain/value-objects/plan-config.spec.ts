import { PlanConfig } from './plan-config';
import { PlanType } from '@user/domain/entities/user';

describe('@user/domain/value-objects/plan-config', () => {
    describe('create', () => {
        it('should create basic plan config', () => {
            const config = PlanConfig.create(PlanType.BASIC);

            expect(config.type).toBe(PlanType.BASIC);
            expect(config.invitationLimit).toBe(1);
            expect(config.name).toBe('Basic Plan');
            expect(config.description).toBe('Create 1 invitation');
        });

        it('should create premium plan config', () => {
            const config = PlanConfig.create(PlanType.PREMIUM);

            expect(config.type).toBe(PlanType.PREMIUM);
            expect(config.invitationLimit).toBe(3);
            expect(config.name).toBe('Premium Plan');
            expect(config.description).toBe('Create up to 3 invitations');
        });

        it('should throw error for invalid plan type', () => {
            expect(() => {
                PlanConfig.create('invalid' as PlanType);
            }).toThrow('Invalid plan type: invalid');
        });
    });

    describe('toJSON', () => {
        it('should return correct JSON representation', () => {
            const config = PlanConfig.create(PlanType.BASIC);
            const json = config.toJSON();

            expect(json).toEqual({
                type: PlanType.BASIC,
                invitationLimit: 1,
                name: 'Basic Plan',
                description: 'Create 1 invitation',
            });
        });
    });
});
