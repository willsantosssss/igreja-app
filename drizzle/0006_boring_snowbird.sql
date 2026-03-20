CREATE TABLE "pagamentosEventos" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventoId" integer NOT NULL,
	"valor" varchar(20) NOT NULL,
	"qrCodeUrl" varchar(500) NOT NULL,
	"chavePix" text NOT NULL,
	"nomeRecebedor" varchar(255) NOT NULL,
	"ativo" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
