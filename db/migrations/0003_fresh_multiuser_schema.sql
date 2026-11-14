CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "is_legacy" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_legacy" boolean DEFAULT false NOT NULL;
--> statement-breakpoint

ALTER TABLE "events"
ADD COLUMN IF NOT EXISTS "user_id" integer;
--> statement-breakpoint

INSERT INTO "users" (
    "name",
    "email",
    "password_hash",
    "is_legacy"
)
SELECT
    'Legacy Event Owner',
    'legacy-owner@calendar-plus.invalid',
    '!LEGACY_ACCOUNT_CANNOT_LOGIN!',
    true
WHERE EXISTS (
    SELECT 1
    FROM "events"
    WHERE "user_id" IS NULL
)
AND NOT EXISTS (
    SELECT 1
    FROM "users"
    WHERE "email" = 'legacy-owner@calendar-plus.invalid'
);
--> statement-breakpoint

UPDATE "events"
SET "user_id" = (
    SELECT "id"
    FROM "users"
    WHERE "email" = 'legacy-owner@calendar-plus.invalid'
    AND "is_legacy" = true
)
WHERE "user_id" IS NULL;
--> statement-breakpoint

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "events"
        WHERE "user_id" IS NULL
    ) THEN
        RAISE EXCEPTION 'Migration stopped: some events have no assigned user';
    END IF;
END $$;
--> statement-breakpoint

ALTER TABLE "events"
DROP CONSTRAINT IF EXISTS "events_user_id_users_id_fk";
--> statement-breakpoint

ALTER TABLE "events"
ADD CONSTRAINT "events_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE NO ACTION;
--> statement-breakpoint

ALTER TABLE "events"
ALTER COLUMN "user_id" SET NOT NULL;