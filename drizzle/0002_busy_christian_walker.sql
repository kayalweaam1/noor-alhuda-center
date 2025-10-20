CREATE TABLE `assistantNotes` (
	`id` varchar(64) NOT NULL,
	`assistantId` varchar(64) NOT NULL,
	`teacherId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`rating` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `assistantNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','teacher','student','assistant') NOT NULL DEFAULT 'student';--> statement-breakpoint
ALTER TABLE `assistantNotes` ADD CONSTRAINT `assistantNotes_assistantId_users_id_fk` FOREIGN KEY (`assistantId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assistantNotes` ADD CONSTRAINT `assistantNotes_teacherId_teachers_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE cascade ON UPDATE no action;