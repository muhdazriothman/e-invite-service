import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || '3000',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/e-invitation',
    JWT_SECRET: process.env.JWT_SECRET
};
