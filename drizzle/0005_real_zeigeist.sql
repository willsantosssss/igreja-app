CREATE TABLE anexosLideres (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	titulo varchar(255) NOT NULL,
	descricao text,
	arquivoUrl varchar(500) NOT NULL,
	nomeArquivo varchar(255) NOT NULL,
	tamanhoArquivo integer DEFAULT 0,
	tipo varchar(50) NOT NULL,
	ativo integer DEFAULT 1,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
