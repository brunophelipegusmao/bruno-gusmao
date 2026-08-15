ALTER TABLE "site_settings" ADD COLUMN "event_name" varchar(100) DEFAULT 'Evento' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "event_description" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "event_image_url" varchar(2048);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "event_bg_color" varchar(50) DEFAULT '#1e293b' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "event_text_color" varchar(50) DEFAULT '#e2e8f0' NOT NULL;