import { ValidationError } from 'class-validator';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
    interface Matchers<R> {
      toHaveValidationError(property: string, constraint?: string): R;
      toHaveNestedValidationError(
        parentProperty: string,
        nestedProperty: string,
        constraint?: string,
        isArray?: boolean,
      ): R;
    }
  }
}

export const validationMatchers = {
    toHaveValidationError(
        received: ValidationError[],
        property: string,
        constraint?: string,
    ) {
        const pass = received.some((error) => {
            const propertyMatch = error.property === property;
            if (!constraint) return propertyMatch;
            return propertyMatch && error.constraints?.[constraint];
        });

        if (pass) {
            return {
                message: () =>
                    `Expected validation errors to not include ${property}${constraint ? ` with constraint ${constraint}` : ''}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `Expected validation errors to include ${property}${constraint ? ` with constraint ${constraint}` : ''}, but found: ${JSON.stringify(received, null, 2)}`,
                pass: false,
            };
        }
    },

    toHaveNestedValidationError(
        received: ValidationError[],
        parentProperty: string,
        nestedProperty: string,
        constraint?: string,
        isArray: boolean = true,
    ) {
        const parentError = received.find(
            (error) => error.property === parentProperty,
        );
        if (!parentError || !parentError.children) {
            return {
                message: () =>
                    `Expected nested validation error for ${parentProperty}.${nestedProperty}, but parent error not found`,
                pass: false,
            };
        }

        if (isArray) {
            const nestedError = parentError.children.find(
                (child) => child.property === '0',
            );
            if (!nestedError || !nestedError.children) {
                return {
                    message: () =>
                        `Expected nested validation error for ${parentProperty}.${nestedProperty}, but nested error not found`,
                    pass: false,
                };
            }

            const propertyError = nestedError.children.find(
                (prop) => prop.property === nestedProperty,
            );
            if (!propertyError) {
                return {
                    message: () =>
                        `Expected nested validation error for ${parentProperty}.${nestedProperty}, but property error not found`,
                    pass: false,
                };
            }

            if (constraint && !propertyError.constraints?.[constraint]) {
                return {
                    message: () =>
                        `Expected nested validation error for ${parentProperty}.${nestedProperty} ` +
                        `with constraint ${constraint}, but constraint not found`,
                    pass: false,
                };
            }
        } else {
            // For nested objects (not arrays)
            const propertyError = parentError.children.find(
                (prop) => prop.property === nestedProperty,
            );
            if (!propertyError) {
                return {
                    message: () =>
                        `Expected nested validation error for ${parentProperty}.${nestedProperty}, but property error not found`,
                    pass: false,
                };
            }

            if (constraint && !propertyError.constraints?.[constraint]) {
                return {
                    message: () =>
                        `Expected nested validation error for ${parentProperty}.${nestedProperty} ` +
                        `with constraint ${constraint}, but constraint not found`,
                    pass: false,
                };
            }
        }

        return {
            message: () =>
                `Expected validation errors to not include nested ${parentProperty}.${nestedProperty}${constraint ? ` with constraint ${constraint}` : ''}`,
            pass: true,
        };
    },
};
