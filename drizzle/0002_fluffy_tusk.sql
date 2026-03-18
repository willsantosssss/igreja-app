CREATE TABLE "documentoslideres" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"arquivourl" varchar(2048) NOT NULL,
	"nomearquivo" varchar(255) NOT NULL,
	"tamanhoarquivo" integer DEFAULT 0 NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"ativo" integer DEFAULT 1 NOT NULL,
	"arquivobase64" text,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "anexosLideres" CASCADE;