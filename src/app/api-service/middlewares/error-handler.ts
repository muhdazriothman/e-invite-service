import { Request, Response, Next } from 'restify';
import { InvalidPayloadError } from '../../../shared/errors/error';

export function errorHandler(err: unknown, req: Request, res: Response, next: Next) {
    if (err instanceof InvalidPayloadError) {
        res.send(400, { error: err.message });
    } else {
        console.error('An unknown error occurred:', err);
        res.send(500, { error: 'An unknown error occurred' });
    }

    next();
}