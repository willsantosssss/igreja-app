CREATE TABLE `avisoImportante` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`dataExpiracao` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avisoImportante_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contatosIgreja` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`email` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contatosIgreja_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`data` varchar(50) NOT NULL,
	`horario` varchar(20) NOT NULL,
	`local` varchar(255) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`requireInscricao` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `noticias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`data` varchar(50) NOT NULL,
	`imagemUrl` varchar(500),
	`destaque` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `noticias_id` PRIMARY KEY(`id`)
);
