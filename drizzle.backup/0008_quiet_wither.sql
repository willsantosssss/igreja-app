CREATE TABLE `dadosContribuicao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pixKey` varchar(255) NOT NULL,
	`pixType` enum('email','cpf','cnpj','telefone','aleatoria') NOT NULL,
	`bank` varchar(255) NOT NULL,
	`agency` varchar(50) NOT NULL,
	`account` varchar(50) NOT NULL,
	`cnpj` varchar(50) NOT NULL,
	`titular` varchar(255) NOT NULL,
	`mensagemMotivacional` text NOT NULL,
	`versiculoRef` varchar(255) NOT NULL,
	`mensagemAgradecimento` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dadosContribuicao_id` PRIMARY KEY(`id`)
);
