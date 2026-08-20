CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`sourceKey` varchar(191) NOT NULL,
	`placeId` varchar(191),
	`name` varchar(255) NOT NULL,
	`segment` varchar(120) NOT NULL,
	`city` varchar(120) NOT NULL,
	`state` varchar(40) NOT NULL,
	`phone` varchar(80),
	`address` text,
	`mapsUrl` text,
	`status` enum('Aguardando','Em Atendimento','Atendido','Recusado') NOT NULL DEFAULT 'Aguardando',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_owner_source_unique` UNIQUE(`ownerId`,`sourceKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
