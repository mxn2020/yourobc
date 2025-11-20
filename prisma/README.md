# Database Schema

This project uses `npx prisma db push` for local development instead of migrations.

To reset the database schema:
1. `DATABASE_URL="postgresql://geenius_user:geenius_password@localhost:5433/geenius_auth" npx prisma db push --accept-data-loss`

To generate the Prisma client:
1. `npx prisma generate`
