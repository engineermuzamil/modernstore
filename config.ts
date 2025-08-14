import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/shopsphere',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  },
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set. Using default localhost connection string.');
  console.warn('   Please set DATABASE_URL environment variable or update config.ts');
}
