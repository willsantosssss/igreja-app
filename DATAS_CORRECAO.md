# Correção de Datas - Calendário Brasileiro

## Informações Importantes

**Data da Correção:** 03 de julho de 2026 (Sexta-feira)
**Timezone:** America/Sao_Paulo
**Formato Padrão:** DD/MM/YYYY

## Utilitário Centralizado

**Arquivo:** `lib/utils/date-br.ts`

Todas as funções de formatação de data devem usar este utilitário.

### Funções Principais

- `formatarDataBR(date)` - Retorna DD/MM/YYYY
- `formatarDataCompletaBR(date)` - Retorna "Sexta-feira, 03 de julho de 2026"
- `formatarDiaSemanaBR(date)` - Retorna "Sexta-feira, 03/07"
- `formatarDiaMesBR(date)` - Retorna "03 de julho"
- `formatarDataCurtaBR(date)` - Retorna "Sexta-feira, 03 julho"
- `calcularIdade(dataNascimento)` - Calcula idade
- `diasAteProximoAniversario(dataNascimento)` - Dias até aniversário
- `parseDataBR(dateStr)` - Parse de data em qualquer formato

## Arquivos Atualizados

1. ✅ `app/(tabs)/agenda.tsx` - Agenda de eventos
2. ✅ `app/(tabs)/index.tsx` - Home screen (em progresso)
3. ⏳ `app/(tabs)/oracao.tsx` - Pedidos de oração
4. ⏳ `app/admin/aniversariantes.tsx` - Aniversariantes
5. ⏳ `app/admin/eventos.tsx` - Gerenciamento de eventos
6. ⏳ `app/admin/escola-crescimento.tsx` - Inscrições em cursos
7. ⏳ `app/admin/inscricoes-eventos.tsx` - Inscrições em eventos
8. ⏳ `app/admin/anexos.tsx` - Anexos
9. ⏳ `app/lider/index.tsx` - Painel do líder

## Script Python para Verificar Banco

**Importante:** Sempre use o script Python para verificar o banco correto do Railway, NUNCA use `webdev_execute_sql`

```bash
python3 scripts/check_database.py [tabela] [limite]
```

**Banco Correto:**
```
mysql://root:dzADEIqMtSkFfNoDFDTIFKTVXkRIwZIH@ballast.proxy.rlwy.net:44986/railway
```

## Próximas Etapas

1. Atualizar todos os arquivos com datas
2. Testar formatação em cada tela
3. Fazer checkpoint com todas as mudanças
