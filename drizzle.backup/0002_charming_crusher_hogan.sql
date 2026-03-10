CREATE TABLE `anotacoesDevocional` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`livro` varchar(100) NOT NULL,
	`capitulo` int NOT NULL,
	`texto` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anotacoesDevocional_id` PRIMARY KEY(`id`)
);
