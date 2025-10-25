CREATE TABLE `appSettings` (
	`id` varchar(64) NOT NULL,
	`welcomeMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `appSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `teachers` MODIFY COLUMN `specialization` enum('تربية','تحفيظ','تربية وتحفيظ');--> statement-breakpoint
ALTER TABLE `students` ADD `specialization` enum('تربية','تحفيظ','تربية وتحفيظ');--> statement-breakpoint
ALTER TABLE `students` ADD `hasPaid` boolean DEFAULT false NOT NULL;