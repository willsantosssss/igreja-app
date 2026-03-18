# Guia: Como Adicionar Documentos/Anexos Diretamente no Banco de Dados

Este guia ensina como inserir documentos (PDF, Word, Excel, etc.) diretamente no banco de dados PostgreSQL sem precisar usar o upload pelo aplicativo.

## Por que fazer isso?

- Testes rápidos sem precisar do app
- Adicionar documentos em massa
- Contornar problemas temporários de upload
- Backup e restauração de documentos

## Passo 1: Converter o Arquivo para Base64

Qualquer arquivo precisa ser convertido para Base64 antes de ser inserido no banco.

### No Linux/Mac:

```bash
# Para um arquivo local
base64 seu-arquivo.pdf

# Para salvar em um arquivo
base64 seu-arquivo.pdf > arquivo_base64.txt
```

### No Windows (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\caminho\seu-arquivo.pdf"))
```

### Online:

Se não tiver acesso a terminal, use um conversor online:
- https://www.base64encode.org/
- Selecione "File" e faça upload do seu arquivo
- Copie o resultado em Base64

## Passo 2: Preparar a Query SQL

Use o template abaixo e substitua os valores:

```sql
INSERT INTO "documentoslideres" (
  "titulo",
  "descricao",
  "arquivo_url",
  "nome_arquivo",
  "tamanho_arquivo",
  "tipo",
  "ativo",
  "arquivo_base64"
) VALUES (
  'Título do Documento',
  'Descrição do documento',
  'data:application/pdf;base64,COLE_O_BASE64_AQUI',
  'nome-do-arquivo.pdf',
  TAMANHO_EM_BYTES,
  'application/pdf',
  1,
  'COLE_O_BASE64_AQUI'
);
```

### Explicação dos campos:

| Campo | Exemplo | Descrição |
|-------|---------|-----------|
| `titulo` | 'Manual de Liderança' | Nome do documento que aparece no app |
| `descricao` | 'Guia para líderes de células' | Descrição opcional |
| `arquivo_url` | 'data:application/pdf;base64,...' | URL do arquivo em Base64 (começa com `data:`) |
| `nome_arquivo` | 'manual.pdf' | Nome do arquivo original |
| `tamanho_arquivo` | 1024000 | Tamanho em bytes (use um valor aproximado) |
| `tipo` | 'application/pdf' | Tipo MIME do arquivo |
| `ativo` | 1 | 1 = visível, 0 = oculto |
| `arquivo_base64` | 'JVBERi0xLjQK...' | Conteúdo do arquivo em Base64 (sem o prefixo `data:`) |

## Passo 3: Tipos MIME Comuns

```
PDF:          application/pdf
Word (.docx): application/vnd.openxmlformats-officedocument.wordprocessingml.document
Word (.doc):  application/msword
Excel (.xlsx): application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Excel (.xls): application/vnd.ms-excel
PowerPoint:   application/vnd.openxmlformats-officedocument.presentationml.presentation
Texto:        text/plain
```

## Exemplo Completo

### 1. Converter arquivo para Base64:

```bash
base64 guia-lideranca.pdf
```

Resultado (primeiras linhas):
```
JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo...
```

### 2. Copiar o Base64 completo

### 3. Executar a query:

```sql
INSERT INTO "documentoslideres" (
  "titulo",
  "descricao",
  "arquivo_url",
  "nome_arquivo",
  "tamanho_arquivo",
  "tipo",
  "ativo",
  "arquivo_base64"
) VALUES (
  'Guia de Liderança',
  'Manual completo para líderes de células',
  'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo...',
  'guia-lideranca.pdf',
  2500000,
  'application/pdf',
  1,
  'JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo...'
);
```

## Passo 4: Executar a Query

### Via Railway Dashboard:

1. Abra o dashboard do Railway
2. Vá para o projeto "Postgres"
3. Clique em "Database"
4. Clique em "Query"
5. Cole a query SQL
6. Clique em "Execute"

### Via Terminal (psql):

```bash
psql "postgresql://postgres:SENHA@mainline.proxy.rlwy.net:51262/railway" << EOF
INSERT INTO "documentoslideres" (
  "titulo",
  "descricao",
  "arquivo_url",
  "nome_arquivo",
  "tamanho_arquivo",
  "tipo",
  "ativo",
  "arquivo_base64"
) VALUES (
  'Seu Título',
  'Sua Descrição',
  'data:application/pdf;base64,SEU_BASE64',
  'seu-arquivo.pdf',
  1000000,
  'application/pdf',
  1,
  'SEU_BASE64'
);
EOF
```

## Passo 5: Verificar no App

1. Recarregue o Expo Go
2. Vá para a seção de "Anexos"
3. O documento deve aparecer na lista
4. Clique para fazer download

## Dicas Importantes

### ⚠️ Limite de Tamanho

- Base64 é ~33% maior que o arquivo original
- PostgreSQL tem limite de ~1GB por célula
- Para arquivos grandes, considere usar storage externo

### 📝 Caracteres Especiais

Se o título tiver aspas, escape com `''`:
```sql
'Guia "Prático" de Liderança'  -- ERRADO
'Guia ''Prático'' de Liderança'  -- CORRETO
```

### 🔍 Verificar Documentos Existentes

```sql
SELECT id, titulo, nome_arquivo, tamanho_arquivo FROM "documentoslideres" ORDER BY id DESC;
```

### 🗑️ Deletar um Documento

```sql
DELETE FROM "documentoslideres" WHERE id = 1;
```

### 🔄 Atualizar um Documento

```sql
UPDATE "documentoslideres" 
SET titulo = 'Novo Título', descricao = 'Nova descrição'
WHERE id = 1;
```

## Troubleshooting

### Erro: "column does not exist"

Verifique se os nomes das colunas estão em snake_case:
- ✅ `arquivo_url`
- ❌ `arquivoUrl`
- ✅ `nome_arquivo`
- ❌ `nomeArquivo`

### Erro: "invalid input syntax for type integer"

O campo `tamanho_arquivo` deve ser um número inteiro, não uma string:
- ✅ `2500000`
- ❌ `'2500000'`

### Arquivo não aparece no app

Verifique se `ativo = 1`:
```sql
SELECT * FROM "documentoslideres" WHERE ativo = 0;
```

Se estiver 0, atualize:
```sql
UPDATE "documentoslideres" SET ativo = 1 WHERE id = 1;
```

## Automatizar com Script

Crie um script `inserir-documento.sh`:

```bash
#!/bin/bash

ARQUIVO="$1"
TITULO="$2"
DESCRICAO="$3"

if [ -z "$ARQUIVO" ] || [ -z "$TITULO" ]; then
  echo "Uso: ./inserir-documento.sh arquivo.pdf 'Título' 'Descrição'"
  exit 1
fi

# Converter para Base64
BASE64=$(base64 "$ARQUIVO" | tr -d '\n')

# Obter tipo MIME
TIPO=$(file -b --mime-type "$ARQUIVO")

# Obter tamanho
TAMANHO=$(stat -f%z "$ARQUIVO" 2>/dev/null || stat -c%s "$ARQUIVO" 2>/dev/null)

# Executar query
psql "postgresql://postgres:SENHA@mainline.proxy.rlwy.net:51262/railway" << EOF
INSERT INTO "documentoslideres" (
  "titulo",
  "descricao",
  "arquivo_url",
  "nome_arquivo",
  "tamanho_arquivo",
  "tipo",
  "ativo",
  "arquivo_base64"
) VALUES (
  '$TITULO',
  '$DESCRICAO',
  'data:$TIPO;base64,$BASE64',
  '$(basename "$ARQUIVO")',
  $TAMANHO,
  '$TIPO',
  1,
  '$BASE64'
);
EOF

echo "✅ Documento inserido com sucesso!"
```

Uso:
```bash
chmod +x inserir-documento.sh
./inserir-documento.sh guia.pdf "Guia de Liderança" "Manual para líderes"
```

## Próximos Passos

Quando o upload pelo app estiver funcionando novamente, você pode:
1. Continuar usando este método para testes
2. Migrar documentos entre ambientes
3. Fazer backup de documentos
4. Restaurar documentos deletados acidentalmente
