# Database Setup for ShopSphere

This project requires a PostgreSQL database to run. You have several options for setting up the database:

## Option 1: Local PostgreSQL Database (Recommended for Development)

### Install PostgreSQL locally:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Create Database and User:
```bash
sudo -u postgres psql
CREATE DATABASE shopsphere;
CREATE USER shopsphere_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE shopsphere TO shopsphere_user;
\q
```

### Set Environment Variable:
```bash
export DATABASE_URL="postgresql://shopsphere_user:your_password@localhost:5432/shopsphere"
```

## Option 2: Neon Database (Cloud PostgreSQL)

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up/Login and create a new project
3. Copy the connection string provided
4. Set it as your DATABASE_URL environment variable

## Option 3: Other Cloud PostgreSQL Providers

- **Supabase**: [supabase.com](https://supabase.com)
- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)

## Setting Environment Variables

### Method 1: Export in Terminal
```bash
export DATABASE_URL="your_connection_string_here"
export JWT_SECRET="your_jwt_secret_here"
```

### Method 2: Create .env File
Create a `.env` file in the project root:
```env
DATABASE_URL=your_connection_string_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

### Method 3: Update config.ts
Edit the `config.ts` file and update the default values.

## Running the Project

After setting up the database:

1. Install dependencies:
```bash
yarn install
```

2. Run database migrations (if any):
```bash
yarn db:push
```

3. Start the development server:
```bash
yarn dev
```

## Troubleshooting

- **Connection refused**: Make sure PostgreSQL is running
- **Authentication failed**: Check username/password in connection string
- **Database does not exist**: Create the database first
- **Permission denied**: Ensure the user has proper privileges

## Default Configuration

The project now includes a `config.ts` file with fallback values for development. You can modify this file to change default database settings without setting environment variables.
