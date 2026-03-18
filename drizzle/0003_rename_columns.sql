-- Renomear colunas para usar snake_case
ALTER TABLE "documentoslideres" 
  RENAME COLUMN "arquivourl" TO "arquivo_url";

ALTER TABLE "documentoslideres" 
  RENAME COLUMN "nomearquivo" TO "nome_arquivo";

ALTER TABLE "documentoslideres" 
  RENAME COLUMN "tamanhoarquivo" TO "tamanho_arquivo";

ALTER TABLE "documentoslideres" 
  RENAME COLUMN "arquivobase64" TO "arquivo_base64";

ALTER TABLE "documentoslideres" 
  RENAME COLUMN "createdat" TO "created_at";

ALTER TABLE "documentoslideres" 
  RENAME COLUMN "updatedat" TO "updated_at";
