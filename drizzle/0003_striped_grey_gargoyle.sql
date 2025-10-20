CREATE TABLE `assistants` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`halaqaName` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `assistants_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistants_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `assistants` ADD CONSTRAINT `assistants_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;