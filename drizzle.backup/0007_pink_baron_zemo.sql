CREATE TABLE `aniversariantes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`dataNascimento` varchar(10) NOT NULL,
	`celula` varchar(255),
	`telefone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aniversariantes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contribuicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`valor` varchar(20) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`data` varchar(50) NOT NULL,
	`comprovanteUrl` varchar(500),
	`status` enum('pendente','confirmado','rejeitado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contribuicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscricoesEventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventoId` int NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`status` enum('confirmado','cancelado') NOT NULL DEFAULT 'confirmado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inscricoesEventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lideres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`celula` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`email` varchar(255),
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lideres_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relatorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`liderId` int NOT NULL,
	`celula` varchar(255) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`periodo` varchar(100) NOT NULL,
	`presentes` int NOT NULL,
	`novosVisitantes` int NOT NULL DEFAULT 0,
	`conversoes` int NOT NULL DEFAULT 0,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `relatorios_id` PRIMARY KEY(`id`)
);
