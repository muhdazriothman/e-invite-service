// Ensure test environment variables are set before any modules are loaded
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Optionally load from a dedicated .env.test file if present
// require('dotenv').config({ path: '.env.test' });
