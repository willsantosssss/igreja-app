ALTER TABLE `anexosLideres` MODIFY COLUMN `arquivoUrl` varchar(2048) NOT NULL;--> statement-breakpoint
ALTER TABLE `anexosLideres` ADD `nomeArquivo` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `anexosLideres` ADD `tamanhoArquivo` int DEFAULT 0 NOT NULL;