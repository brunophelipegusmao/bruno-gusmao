ALTER TABLE "badges" ADD COLUMN "bg_color" varchar(50) DEFAULT '#1e293b' NOT NULL;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "text_color" varchar(50) DEFAULT '#e2e8f0' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "kanban_status" varchar(50) DEFAULT 'backlog' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "kanban_status" varchar(50) DEFAULT 'backlog' NOT NULL;