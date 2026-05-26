CREATE TABLE "kanban_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(1000),
	"task_type" varchar(50) DEFAULT 'blog' NOT NULL,
	"kanban_status" varchar(50) DEFAULT 'backlog' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
