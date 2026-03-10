CREATE TABLE `anexosLideres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`arquivoUrl` varchar(500) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anexosLideres_id` PRIMARY KEY(`id`)
);
