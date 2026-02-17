// Estrutura do Novo Testamento: 260 capítulos
export interface BookChapter {
  book: string;
  chapter: number;
  totalChapters: number;
  verses: string[];
}

export const newTestamentStructure = [
  { book: "Mateus", chapters: 28 },
  { book: "Marcos", chapters: 16 },
  { book: "Lucas", chapters: 24 },
  { book: "João", chapters: 21 },
  { book: "Atos", chapters: 28 },
  { book: "Romanos", chapters: 16 },
  { book: "1 Coríntios", chapters: 16 },
  { book: "2 Coríntios", chapters: 13 },
  { book: "Gálatas", chapters: 6 },
  { book: "Efésios", chapters: 6 },
  { book: "Filipenses", chapters: 4 },
  { book: "Colossenses", chapters: 4 },
  { book: "1 Tessalonicenses", chapters: 5 },
  { book: "2 Tessalonicenses", chapters: 3 },
  { book: "1 Timóteo", chapters: 6 },
  { book: "2 Timóteo", chapters: 4 },
  { book: "Tito", chapters: 3 },
  { book: "Filemom", chapters: 1 },
  { book: "Hebreus", chapters: 13 },
  { book: "Tiago", chapters: 5 },
  { book: "1 Pedro", chapters: 5 },
  { book: "2 Pedro", chapters: 3 },
  { book: "1 João", chapters: 5 },
  { book: "2 João", chapters: 1 },
  { book: "3 João", chapters: 1 },
  { book: "Judas", chapters: 1 },
  { book: "Apocalipse", chapters: 22 },
];

// Total de capítulos: 260
export const totalChapters = newTestamentStructure.reduce((sum, book) => sum + book.chapters, 0);

// Função para obter o capítulo do dia baseado no dia do ano
export function getChapterOfDay(dayOfYear: number): { book: string; chapter: number; index: number } {
  const index = (dayOfYear - 1) % totalChapters;
  let currentIndex = 0;
  
  for (const bookInfo of newTestamentStructure) {
    if (currentIndex + bookInfo.chapters > index) {
      const chapter = index - currentIndex + 1;
      return { book: bookInfo.book, chapter, index };
    }
    currentIndex += bookInfo.chapters;
  }
  
  return { book: "Mateus", chapter: 1, index: 0 };
}

// Função para obter o dia do ano
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Função para obter informações do capítulo por índice
export function getChapterByIndex(index: number): { book: string; chapter: number; index: number } {
  const normalizedIndex = ((index % totalChapters) + totalChapters) % totalChapters;
  let currentIndex = 0;
  
  for (const bookInfo of newTestamentStructure) {
    if (currentIndex + bookInfo.chapters > normalizedIndex) {
      const chapter = normalizedIndex - currentIndex + 1;
      return { book: bookInfo.book, chapter, index: normalizedIndex };
    }
    currentIndex += bookInfo.chapters;
  }
  
  return { book: "Mateus", chapter: 1, index: 0 };
}

// Textos de exemplo (primeiros versículos de cada livro)
export const sampleTexts: Record<string, Record<number, string[]>> = {
  "Mateus": {
    1: [
      "Livro da genealogia de Jesus Cristo, filho de Davi, filho de Abraão.",
      "Abraão gerou a Isaque; Isaque gerou a Jacó; Jacó gerou a Judá e a seus irmãos;",
      "Judá gerou, de Tamar, a Perez e a Zera; Perez gerou a Esrom; Esrom gerou a Arão;",
    ],
  },
  "João": {
    1: [
      "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
      "Ele estava no princípio com Deus.",
      "Todas as coisas foram feitas por intermédio dele, e, sem ele, nada do que foi feito se fez.",
      "A vida estava nele e a vida era a luz dos homens.",
      "A luz resplandece nas trevas, e as trevas não prevaleceram contra ela.",
    ],
  },
  "Romanos": {
    1: [
      "Paulo, servo de Jesus Cristo, chamado para ser apóstolo, separado para o evangelho de Deus,",
      "o qual foi por ele, outrora, prometido por intermédio dos seus profetas nas Sagradas Escrituras,",
      "com respeito a seu Filho, o qual, segundo a carne, veio da descendência de Davi",
      "e foi designado Filho de Deus com poder, segundo o Espírito de santidade pela ressurreição dos mortos, a saber, Jesus Cristo, nosso Senhor,",
    ],
  },
};

// Função para obter texto de exemplo
export function getSampleText(book: string, chapter: number): string[] {
  if (sampleTexts[book] && sampleTexts[book][chapter]) {
    return sampleTexts[book][chapter];
  }
  
  // Texto padrão se não houver exemplo
  return [
    `Este é o capítulo ${chapter} de ${book}.`,
    "O texto completo estará disponível em breve.",
    "Continue sua jornada de leitura diária do Novo Testamento!",
  ];
}
