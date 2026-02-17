CREATE TABLE `celulas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`lider` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`endereco` varchar(255) NOT NULL,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`diaReuniao` varchar(50) NOT NULL,
	`horario` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `celulas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscricoesBatismo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`dataNascimento` varchar(10) NOT NULL,
	`celula` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`motivacao` text NOT NULL,
	`status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`dataProcessamento` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inscricoesBatismo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidosOracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`categoria` varchar(50) NOT NULL,
	`contadorOrando` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedidosOracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usuariosCadastrados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`dataNascimento` varchar(10) NOT NULL,
	`celula` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usuariosCadastrados_id` PRIMARY KEY(`id`)
);
