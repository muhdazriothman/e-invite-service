import mongoose from 'mongoose';
import { config } from '../config.js';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI, { dbName: 'e-invitation' });
        console.log('✅ MongoDB Connected!');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
