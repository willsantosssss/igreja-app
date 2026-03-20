CREATE TYPE public.status_pagamento AS ENUM('pago', 'nao-pago');--> statement-breakpoint
ALTER TABLE inscricoesEventos ADD COLUMN email varchar(320);--> statement-breakpoint
ALTER TABLE inscricoesEventos ADD COLUMN statusPagamento status_pagamento DEFAULT 'nao-pago' NOT NULL;--> statement-breakpoint
ALTER TABLE inscricoesEventos ADD COLUMN dataPagamento timestamp;--> statement-breakpoint
ALTER TABLE inscricoesEventos ADD COLUMN observacoes text;