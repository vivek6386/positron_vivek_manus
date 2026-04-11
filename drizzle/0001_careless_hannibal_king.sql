CREATE TABLE `otpVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contact` varchar(320) NOT NULL,
	`contactType` enum('email','phone') NOT NULL,
	`code` varchar(6) NOT NULL,
	`verified` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otpVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contact` varchar(320) NOT NULL,
	`contactType` enum('email','phone') NOT NULL,
	`verified` int NOT NULL DEFAULT 0,
	`isPrimary` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userContacts_id` PRIMARY KEY(`id`)
);
