import restify from 'restify';
import { userRoutes } from './routes/user';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error-handler';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Register user routes
userRoutes(server);

// Register the shared error handler
server.on('restifyError', (req, res, err, next) => {
    errorHandler(err, req, res, next);
});

server.listen(8080, () => {
    console.log('%s listening at %s', server.name, server.url);
});