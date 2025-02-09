import { FastifyReply } from 'fastify';
import { ApplicationError } from '../application/exceptions';

export class ErrorResolver {
    static resolve(error: unknown, reply: FastifyReply): void {
        if (error instanceof ApplicationError) {
            reply.status(error.statusCode).send({
                success: false,
                errorCode: error.errorCode,
                message: error.message,
            });
        } else if (error instanceof Error) {
            // Handle generic JavaScript errors
            reply.status(500).send({
                success: false,
                errorCode: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Something went wrong',
            });
        } else {
            // Handle unexpected non-error objects
            reply.status(500).send({
                success: false,
                errorCode: 'INTERNAL_SERVER_ERROR',
                message: 'An unknown error occurred',
            });
        }
    }
}
