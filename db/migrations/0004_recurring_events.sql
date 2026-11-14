CREATE TABLE IF NOT EXISTS "event_exceptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"original_start" timestamp NOT NULL,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"date" timestamp,
	"end_date" timestamp,
	"title" text,
	"description" text,
	"category" text,
	CONSTRAINT "event_exceptions_event_original_start_unique" UNIQUE("event_id","original_start")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_legacy" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "recurrence_rule" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "recurrence_timezone" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_exceptions" ADD CONSTRAINT "event_exceptions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
