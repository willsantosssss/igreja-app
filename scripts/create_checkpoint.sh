#!/bin/bash

#############################################################################
# Script para criar checkpoint automático do app 2iEQ
# Uso: ./scripts/create_checkpoint.sh "Descrição das alterações"
#############################################################################

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validar argumentos
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Erro: Descrição do checkpoint não fornecida${NC}"
    echo ""
    echo "Uso: ./scripts/create_checkpoint.sh \"Descrição das alterações\""
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/create_checkpoint.sh \"Alterado nome da igreja e cores\""
    echo "  ./scripts/create_checkpoint.sh \"Adicionados 3 novos eventos\""
    exit 1
fi

DESCRICAO="$1"

# Validar diretório
if [ ! -f "app.config.ts" ]; then
    echo -e "${RED}❌ Erro: Script deve ser executado do diretório raiz do projeto${NC}"
    echo "Navegue para: /home/ubuntu/igreja-app"
    exit 1
fi

# Header
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}📸 CRIANDO CHECKPOINT DO APP 2IEQ${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Data/Hora
TIMESTAMP=$(date "+%d/%m/%Y %H:%M:%S")
echo -e "${YELLOW}⏰ Data/Hora:${NC} $TIMESTAMP"
echo -e "${YELLOW}📝 Descrição:${NC} $DESCRICAO"
echo ""

# Verificar status do git
echo -e "${YELLOW}📊 Status do repositório:${NC}"
if command -v git &> /dev/null; then
    git_status=$(git status --short 2>/dev/null)
    if [ -z "$git_status" ]; then
        echo -e "${GREEN}✅ Nenhuma alteração detectada (repositório limpo)${NC}"
    else
        echo "$git_status"
    fi
else
    echo -e "${YELLOW}⚠️  Git não encontrado${NC}"
fi

echo ""

# Instruções
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}📌 PRÓXIMOS PASSOS${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "${GREEN}✅ Para criar o checkpoint, execute no Manus:${NC}"
echo ""
echo "   Crie um checkpoint com a descrição: \"$DESCRICAO\""
echo ""
echo -e "${YELLOW}Ou use o painel de gerenciamento:${NC}"
echo "   1. Clique em 'Publish' no painel de controle"
echo "   2. Selecione 'Create Checkpoint'"
echo "   3. Adicione a descrição e confirme"
echo ""
echo -e "${GREEN}Seu checkpoint será criado com sucesso! 🎉${NC}"
echo ""
