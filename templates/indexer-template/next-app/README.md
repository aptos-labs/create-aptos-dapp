# Aptos full stack template UI

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Local development

This template uses `@vercel/postgres` to connect to a Postgres database. When testing locally, it cannot connect to local DB. You have to either use a cloud DB on Vercel or a local DB in Docker. I highly recommend using an independent cloud DB on Vercel. You can learn more on [Vercel docs](https://vercel.com/docs/storage/vercel-postgres/local-development).

## Create a read only user in DB

This frontend should only read from the DB, the indexer is the only one that writes to the DB. So, create a read only user in the DB for frontend to use for safety.

```sql
-- Create a readonly user
-- Please don't use any special characters in the password to avoid @vercel/postgres give invalid connection string error
CREATE USER readonly WITH PASSWORD 'strong_password'
-- Grant readonly user read access to all tables in public schema
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
-- Grant readonly user read access to all future tables in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly;
```

Some useful SQLs to check the user and schema:

```sql
-- Get all users
SELECT * FROM pg_user;
-- Get all schemas
SELECT schema_name FROM information_schema.schemata;
```

Then fill the `POSTGRES_URL` in `.env` file with the readonly user.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
