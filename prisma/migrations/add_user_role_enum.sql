-- Create the UserRole enum type
CREATE TYPE "UserRole" AS ENUM ('superadmin', 'admin', 'user', 'moderator', 'editor', 'analyst', 'guest');

-- Add a temporary column with the enum type
ALTER TABLE "user" ADD COLUMN "role_new" "UserRole";

-- Copy and cast existing role values to the new enum column
-- Set default to 'user' for any invalid values
UPDATE "user" SET "role_new" =
  CASE
    WHEN "role" IN ('superadmin', 'admin', 'user', 'moderator', 'editor', 'analyst', 'guest')
    THEN "role"::"UserRole"
    ELSE 'user'::"UserRole"
  END;

-- Set NOT NULL constraint and default value
ALTER TABLE "user" ALTER COLUMN "role_new" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "role_new" SET DEFAULT 'user'::"UserRole";

-- Drop the old column
ALTER TABLE "user" DROP COLUMN "role";

-- Rename the new column to 'role'
ALTER TABLE "user" RENAME COLUMN "role_new" TO "role";
