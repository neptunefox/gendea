CREATE TABLE "cauldron_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text,
	"content" text NOT NULL,
	"order" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cauldron_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"ingredient_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"output_idea_id" uuid,
	"output_text" text,
	"patterns" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oracle_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sparked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "oracle_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" text NOT NULL,
	"idea_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"source" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_cauldron_output" integer DEFAULT 0 NOT NULL,
	"cauldron_session_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spark_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt" text NOT NULL,
	"core_ideas" jsonb NOT NULL,
	"lenses" jsonb NOT NULL,
	"nudges" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarot_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" text NOT NULL,
	"date" text NOT NULL,
	"card_options" jsonb NOT NULL,
	"chosen_card" text,
	"interpretation" text,
	"spark_prompt" text,
	"used_as_input" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cauldron_ingredients" ADD CONSTRAINT "cauldron_ingredients_session_id_cauldron_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."cauldron_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oracle_messages" ADD CONSTRAINT "oracle_messages_session_id_oracle_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."oracle_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oracle_sessions" ADD CONSTRAINT "oracle_sessions_idea_id_saved_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."saved_ideas"("id") ON DELETE no action ON UPDATE no action;