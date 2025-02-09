export class ApplicationError extends Error {
    public statusCode: number;
    public errorCode: string;
  
    constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
  
        // Ensure the correct prototype chain for built-in subclassing
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationError extends ApplicationError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class BusinessLogicError extends ApplicationError {
    constructor(message: string) {
        super(message, 400, 'BUSINESS_LOGIC_ERROR');
    }
}

export class NotFoundError extends ApplicationError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND');
    }
}
