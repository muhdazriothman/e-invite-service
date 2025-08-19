import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import {
    connect,
    disconnect,
    Connection as MongoConnection,
} from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export interface MongoTestSetupOptions {
    schemas: Array<{
        name: string;
        schema: any;
    }>;
    providers?: any[];
}

export interface MongoTestContext {
    connection: MongoConnection;
    module: TestingModule;
    mongoMemoryServer: MongoMemoryServer;
    cleanup: () => Promise<void>;
}

export class MongoTestSetup {
    private static mongoMemoryServer: MongoMemoryServer;
    private static connection: MongoConnection;
    private static module: TestingModule;

    static async setup(options: MongoTestSetupOptions): Promise<MongoTestContext> {
        // Start in-memory MongoDB server if not already started
        if (!this.mongoMemoryServer) {
            this.mongoMemoryServer = await MongoMemoryServer.create();
        }

        const mongoUri = this.mongoMemoryServer.getUri();

        // Connect to in-memory database
        this.connection = (await connect(mongoUri)).connection;

        // Create test module
        this.module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                MongooseModule.forFeature(options.schemas),
            ],
            providers: options.providers || [],
        }).compile();

        return {
            connection: this.connection,
            module: this.module,
            mongoMemoryServer: this.mongoMemoryServer,
            cleanup: this.cleanup.bind(this),
        };
    }

    static async cleanup(): Promise<void> {
        if (this.connection) {
            await disconnect();
        }
        if (this.module) {
            await this.module.close();
        }
    }

    static async stop(): Promise<void> {
        await this.cleanup();
        if (this.mongoMemoryServer) {
            await this.mongoMemoryServer.stop();
            this.mongoMemoryServer = null as any;
            this.connection = null as any;
            this.module = null as any;
        }
    }

    static getConnection(): MongoConnection {
        return this.connection;
    }

    static getModule(): TestingModule {
        return this.module;
    }
}

// Helper function for repository tests
export async function setupRepositoryTest(
    schemas: Array<{ name: string; schema: any }>,
    providers: any[] = []
): Promise<MongoTestContext> {
    return MongoTestSetup.setup({ schemas, providers });
}
