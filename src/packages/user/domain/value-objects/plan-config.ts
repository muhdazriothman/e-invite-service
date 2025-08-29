import { PlanType } from '@user/domain/entities/user';

export class PlanConfig {
    constructor(
        public readonly type: PlanType,
        public readonly invitationLimit: number,
        public readonly name: string,
        public readonly description?: string
    ) { }

    static create(type: PlanType): PlanConfig {
        const configs = {
            [PlanType.BASIC]: new PlanConfig(
                PlanType.BASIC,
                1,
                'Basic Plan',
                'Create 1 invitation'
            ),
            [PlanType.PREMIUM]: new PlanConfig(
                PlanType.PREMIUM,
                3,
                'Premium Plan',
                'Create up to 3 invitations'
            )
        };

        if (!configs[type]) {
            throw new Error(`Invalid plan type: ${type}`);
        }

        return configs[type];
    }

    toJSON() {
        return {
            type: this.type,
            invitationLimit: this.invitationLimit,
            name: this.name,
            description: this.description,
        };
    }
}
