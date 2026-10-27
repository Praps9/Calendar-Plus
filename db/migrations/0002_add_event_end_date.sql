ALTER TABLE "events"
ADD COLUMN "end_date" timestamp;

UPDATE "events"
SET "end_date" = "date" + INTERVAL '1 hour'
WHERE "end_date" IS NULL;

ALTER TABLE "events"
ALTER COLUMN "end_date" SET NOT NULL;