CREATE TABLE `configEscolaCrescimento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataInicio` varchar(10) NOT NULL,
	`descricaoConecte` text NOT NULL,
	`descricaoLidere1` text NOT NULL,
	`descricaoLidere2` text NOT NULL,
	`descricaoAvance` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configEscolaCrescimento_id` PRIMARY KEY(`id`)
);
