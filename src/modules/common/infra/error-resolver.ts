import { FastifyReply } from 'fastify';
import { ApplicationError } from '../application/exceptions';

export class ErrorResolver {
    static resolve(error: unknown, reply: FastifyReply): void {
        if (error instanceof ApplicationError) {
            reply.status(error.statusCode).send({
                status: error.status,
                message: error.message,
                errorCode: error.errorCode,
                errors: error.errors,
            });
        } else if (error instanceof Error) {
            // Handle generic JavaScript errors
            reply.status(500).send({
                status: 'error',
                message: error.message || 'Something went wrong',
                errorCode: 'INTERNAL_SERVER_ERROR',
            });
        } else {
            // Handle unexpected non-error objects
            reply.status(500).send({
                status: 'error',
                message: 'An unknown error occurred',
                errorCode: 'INTERNAL_SERVER_ERROR',
            });
        }
    }
}
