import Fastify from 'fastify';
import { config } from './config';
import { connectDB } from './database/mongodb';
import { userRoutes } from './modules/users/routes';
import { Service } from './service';
import { ErrorResolver } from './modules/common/infra/error-resolver';

const fastify = Fastify({ logger: true });

// Initialize MongoDB Connection
connectDB();

// Initialize services
const service = Service.create();
fastify.decorate('service', service);

// Register Routes
fastify.register(userRoutes);

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
    ErrorResolver.resolve(error, reply);
});

// Start the server
const start = async (): Promise<void> => {
    try {
        await fastify.listen({ port: Number(config.PORT), host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
