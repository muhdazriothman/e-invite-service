interface ErrorContext {
    [key: string]: any;
}

interface ApplicationErrorProps {
    message: string;
    statusCode?: number;
    errorCode?: string;
    errors?: ErrorContext;
}

export class ApplicationError extends Error {
    status: 'fail' | 'error';
    statusCode: number;
    errorCode: string;
    errors?: ErrorContext;

    constructor(props: ApplicationErrorProps) {
        const {
            message,
            statusCode = 500,
            errorCode = 'INTERNAL_SERVER_ERROR',
            errors,
        } = props;

        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = statusCode >= 500 ? 'error' : 'fail';
        this.errorCode = errorCode;
        this.errors = errors;

        // Ensure the correct prototype chain for built-in subclassing
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationError extends ApplicationError {
    constructor(props: Omit<ApplicationErrorProps, 'statusCode' | 'errorCode'>) {
        console.log('ValidationError props', props);
        
        super({
            message: props.message,
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
            errors: props.errors,
        });
    }
}

export class BusinessLogicError extends ApplicationError {
    constructor(props: Omit<ApplicationErrorProps, 'statusCode' | 'errorCode'>) {
        super({
            message: props.message,
            statusCode: 409,
            errorCode: 'BUSINESS_LOGIC_ERROR',
            errors: props.errors,
        });
    }
}

export class NotFoundError extends ApplicationError {
    constructor(message: string) {
        super({
            message,
            statusCode: 404,
            errorCode: 'NOT_FOUND',
        });
    }
}

export class InternalServerError extends ApplicationError {
    constructor(message: string = 'Something went wrong. Please try again later.') {
        super({
            message,
            statusCode: 500,
            errorCode: 'INTERNAL_SERVER_ERROR',
        });
    }
}
