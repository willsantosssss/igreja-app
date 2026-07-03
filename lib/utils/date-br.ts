/**
 * Utilitário para formatação de datas em padrão brasileiro
 * Timezone: America/Sao_Paulo
 * Formato padrão: DD/MM/YYYY
 */

const TIMEZONE = 'America/Sao_Paulo';

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
];

/**
 * Converte uma string de data para objeto Date
 * Aceita formatos: YYYY-MM-DD, DD/MM/YYYY, ISO 8601
 * Usa ISO format com Z para garantir que a data nao sofra offset de timezone
 */
export function parseDataBR(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Se for ISO 8601 (com T), parse normalmente
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }

  // Se for YYYY-MM-DD
  if (dateStr.includes('-') && dateStr.length === 10) {
    const [ano, mes, dia] = dateStr.split('-');
    const isoStr = `${ano}-${String(parseInt(mes)).padStart(2, '0')}-${String(parseInt(dia)).padStart(2, '0')}`;
    return new Date(isoStr + 'T00:00:00Z');
  }

  // Se for DD/MM/YYYY
  if (dateStr.includes('/')) {
    const [dia, mes, ano] = dateStr.split('/');
    const isoStr = `${ano}-${String(parseInt(mes)).padStart(2, '0')}-${String(parseInt(dia)).padStart(2, '0')}`;
    return new Date(isoStr + 'T00:00:00Z');
  }

  return new Date(dateStr);
}

/**
 * Formata uma data para DD/MM/YYYY
 */
export function formatarDataBR(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? parseDataBR(date) : date;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch {
    return '';
  }
}

/**
 * Formata uma data para "Dia da Semana, DD de Mês de YYYY"
 * Ex: "Sexta-feira, 03 de julho de 2026"
 */
export function formatarDataCompletaBR(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? parseDataBR(date) : date;
    const diaSemana = DIAS_SEMANA[d.getDay()];
    const dia = d.getDate();
    const mes = MESES[d.getMonth()];
    const ano = d.getFullYear();
    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  } catch {
    return '';
  }
}

/**
 * Formata uma data para "Dia da Semana, DD/MM"
 * Ex: "Sexta-feira, 03/07"
 */
export function formatarDiaSemanaBR(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? parseDataBR(date) : date;
    const diaSemana = DIAS_SEMANA[d.getDay()];
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${diaSemana}, ${dia}/${mes}`;
  } catch {
    return '';
  }
}

/**
 * Formata uma data para "DD de Mês"
 * Ex: "03 de julho"
 */
export function formatarDiaMesBR(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? parseDataBR(date) : date;
    const dia = d.getDate();
    const mes = MESES[d.getMonth()];
    return `${dia} de ${mes}`;
  } catch {
    return '';
  }
}

/**
 * Formata uma data para "Dia da Semana, DD Mês"
 * Ex: "Sexta-feira, 03 julho"
 */
export function formatarDataCurtaBR(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? parseDataBR(date) : date;
    const diaSemana = DIAS_SEMANA[d.getDay()];
    const dia = d.getDate();
    const mes = MESES[d.getMonth()];
    return `${diaSemana}, ${dia} ${mes}`;
  } catch {
    return '';
  }
}

/**
 * Retorna a data atual em timezone do Brasil
 */
export function obterDataHojeBR(): Date {
  return new Date();
}

/**
 * Retorna o mês atual (1-12)
 */
export function obterMesAtual(): number {
  return new Date().getMonth() + 1;
}

/**
 * Retorna o dia atual (1-31)
 */
export function obterDiaAtual(): number {
  return new Date().getDate();
}

/**
 * Retorna o ano atual
 */
export function obterAnoAtual(): number {
  return new Date().getFullYear();
}

/**
 * Calcula a idade baseado na data de nascimento
 */
export function calcularIdade(dataNascimento: string | Date): number {
  const hoje = new Date();
  const d = typeof dataNascimento === 'string' ? parseDataBR(dataNascimento) : dataNascimento;
  
  let idade = hoje.getFullYear() - d.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = d.getMonth();
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < d.getDate())) {
    idade--;
  }
  
  return idade;
}

/**
 * Calcula dias até o próximo aniversário
 */
export function diasAteProximoAniversario(dataNascimento: string | Date): number {
  const hoje = new Date();
  const d = typeof dataNascimento === 'string' ? parseDataBR(dataNascimento) : dataNascimento;
  
  let proximoAniversario = new Date(hoje.getFullYear(), d.getMonth(), d.getDate());
  
  if (proximoAniversario < hoje) {
    proximoAniversario.setFullYear(proximoAniversario.getFullYear() + 1);
  }
  
  const diferenca = proximoAniversario.getTime() - hoje.getTime();
  return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se uma data é hoje
 */
export function ehHoje(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseDataBR(date) : date;
  const hoje = new Date();
  return (
    d.getDate() === hoje.getDate() &&
    d.getMonth() === hoje.getMonth() &&
    d.getFullYear() === hoje.getFullYear()
  );
}

/**
 * Verifica se uma data é no futuro
 */
export function ehNoFuturo(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseDataBR(date) : date;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d > hoje;
}

/**
 * Verifica se uma data é no passado
 */
export function ehNoPassado(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseDataBR(date) : date;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < hoje;
}

/**
 * Compara duas datas (retorna -1 se a < b, 0 se a === b, 1 se a > b)
 */
export function compararDatas(dataA: Date | string, dataB: Date | string): number {
  const a = typeof dataA === 'string' ? parseDataBR(dataA) : dataA;
  const b = typeof dataB === 'string' ? parseDataBR(dataB) : dataB;
  
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Valida se uma string está no formato DD/MM/YYYY
 */
export function validarFormatoDDMMYYYY(dateStr: string): boolean {
  const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
  return regex.test(dateStr);
}

/**
 * Valida se uma string está no formato YYYY-MM-DD
 */
export function validarFormatoYYYYMMDD(dateStr: string): boolean {
  const regex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12]\d|3[01])$/;
  return regex.test(dateStr);
}
