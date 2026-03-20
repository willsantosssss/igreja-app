CREATE TABLE anexos (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	relatorioId integer NOT NULL,
	nomeArquivo varchar(255) NOT NULL,
	urlArquivo varchar(500) NOT NULL,
	tipo varchar(50) NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE aniversariantes (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	nome varchar(255) NOT NULL,
	dataNascimento varchar(10) NOT NULL,
	celula varchar(255),
	telefone varchar(20),
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE anotacoesDevocional (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userId integer NOT NULL,
	livro varchar(100) NOT NULL,
	capitulo integer NOT NULL,
	texto text NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE avisoImportante (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	titulo varchar(255) NOT NULL,
	mensagem text NOT NULL,
	ativo integer DEFAULT 1 NOT NULL,
	dataExpiracao varchar(50),
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE celulas (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	nome varchar(255) NOT NULL,
	lider varchar(255) NOT NULL,
	telefone varchar(20) NOT NULL,
	endereco varchar(255) NOT NULL,
	latitude text NOT NULL,
	longitude text NOT NULL,
	diaReuniao varchar(50) NOT NULL,
	horario varchar(10) NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE contatosIgreja (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	telefone varchar(20) NOT NULL,
	whatsapp varchar(20) NOT NULL,
	email varchar(255) NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE contribuicoes (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userId integer NOT NULL,
	nome varchar(255) NOT NULL,
	valor varchar(20) NOT NULL,
	tipo varchar(50) NOT NULL,
	data varchar(50) NOT NULL,
	comprovanteUrl varchar(500),
	status varchar(50) DEFAULT 'pendente' NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE dadosContribuicao (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	pixKey varchar(255) NOT NULL,
	pixType varchar(50) NOT NULL,
	bank varchar(255) NOT NULL,
	agency varchar(50) NOT NULL,
	account varchar(50) NOT NULL,
	cnpj varchar(50) NOT NULL,
	titular varchar(255) NOT NULL,
	mensagemMotivacional text NOT NULL,
	versiculoRef varchar(255) NOT NULL,
	mensagemAgradecimento text NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE eventos (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	titulo varchar(255) NOT NULL,
	descricao text NOT NULL,
	data varchar(50) NOT NULL,
	horario varchar(20) NOT NULL,
	local varchar(255) NOT NULL,
	tipo varchar(50) NOT NULL,
	requireInscricao integer DEFAULT 0 NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE inscricoesBatismo (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	nome varchar(255) NOT NULL,
	dataNascimento varchar(10) NOT NULL,
	celula varchar(255) NOT NULL,
	telefone varchar(20) NOT NULL,
	motivacao text NOT NULL,
	status varchar(50) DEFAULT 'pendente' NOT NULL,
	dataProcessamento timestamp,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE inscricoesEscolaCrescimento (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userId integer NOT NULL,
	nome varchar(255) NOT NULL,
	celula varchar(255) NOT NULL,
	curso varchar(100) NOT NULL,
	status varchar(50) DEFAULT 'confirmado' NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE inscricoesEventos (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	eventoId integer NOT NULL,
	userId integer NOT NULL,
	nome varchar(255) NOT NULL,
	telefone varchar(20) NOT NULL,
	celula varchar(255) NOT NULL,
	status varchar(50) DEFAULT 'confirmado' NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE lideres (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userId integer NOT NULL,
	nome varchar(255) NOT NULL,
	celula varchar(255) NOT NULL,
	telefone varchar(20) NOT NULL,
	email varchar(255),
	ativo integer DEFAULT 1 NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE noticias (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	titulo varchar(255) NOT NULL,
	conteudo text NOT NULL,
	data varchar(50) NOT NULL,
	imagemUrl varchar(500),
	destaque integer DEFAULT 0 NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE pedidosOracao (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	nome varchar(255) NOT NULL,
	descricao text NOT NULL,
	categoria varchar(50) NOT NULL,
	contadorOrando integer DEFAULT 0 NOT NULL,
	respondido integer DEFAULT 0 NOT NULL,
	testemunho text,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE relatorios (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	liderId integer NOT NULL,
	celula varchar(255) NOT NULL,
	tipo varchar(50) NOT NULL,
	periodo varchar(100) NOT NULL,
	presentes integer NOT NULL,
	novosVisitantes integer DEFAULT 0 NOT NULL,
	conversoes integer DEFAULT 0 NOT NULL,
	observacoes text,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	openId varchar(64),
	name text,
	email varchar(320),
	passwordHash text,
	loginMethod varchar(64),
	role varchar(50) DEFAULT 'user' NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL,
	lastSignedIn timestamp DEFAULT now() NOT NULL,
	CONSTRAINT users_openId_unique UNIQUE(openId),
	CONSTRAINT users_email_unique UNIQUE(email)
);
--> statement-breakpoint
CREATE TABLE usuariosCadastrados (
	id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
	userId integer NOT NULL,
	nome varchar(255) NOT NULL,
	dataNascimento varchar(10),
	celula varchar(255) NOT NULL,
	createdAt timestamp DEFAULT now() NOT NULL,
	updatedAt timestamp DEFAULT now() NOT NULL
);
