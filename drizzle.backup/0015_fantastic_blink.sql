CREATE TABLE `inscricoesEscolaCrescimento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`celula` varchar(255) NOT NULL,
	`curso` enum('Conecte','Lidere 1','Lidere 2','Avance') NOT NULL,
	`userId` int,
	`status` enum('confirmado','cancelado') NOT NULL DEFAULT 'confirmado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inscricoesEscolaCrescimento_id` PRIMARY KEY(`id`)
);
