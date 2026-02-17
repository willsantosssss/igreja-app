/**
 * Banco de Dados Local de Textos do Novo Testamento (NAA)
 * Usado como fallback quando API não está disponível
 * Contém primeiros versículos de cada capítulo para demonstração
 */

export interface TextoBiblico {
  livro: string;
  capitulo: number;
  versos: {
    numero: number;
    texto: string;
  }[];
}

export const TEXTOS_NT_FALLBACK: TextoBiblico[] = [
  {
    livro: 'Mateus',
    capitulo: 1,
    versos: [
      { numero: 1, texto: 'Livro da genealogia de Jesus Cristo, filho de Davi, filho de Abraão.' },
      { numero: 2, texto: 'Abraão gerou Isaque; Isaque gerou Jacó; Jacó gerou Judá e seus irmãos;' },
      { numero: 3, texto: 'Judá gerou Farés e Zará, de Tamar; Farés gerou Esrom; Esrom gerou Arão;' },
    ],
  },
  {
    livro: 'Mateus',
    capitulo: 2,
    versos: [
      { numero: 1, texto: 'Tendo Jesus nascido em Belém da Judeia, nos dias do rei Herodes, eis que uns magos vieram do Oriente a Jerusalém,' },
      { numero: 2, texto: 'Dizendo: Onde está aquele que é nascido rei dos judeus? Porque vimos a sua estrela no Oriente e viemos a adorá-lo.' },
    ],
  },
  {
    livro: 'Mateus',
    capitulo: 3,
    versos: [
      { numero: 1, texto: 'Naqueles dias apareceu João Batista, pregando no deserto da Judeia,' },
      { numero: 2, texto: 'E dizendo: Arrependei-vos, porque é chegado o reino dos céus.' },
    ],
  },
  {
    livro: 'Mateus',
    capitulo: 4,
    versos: [
      { numero: 1, texto: 'Então foi Jesus levado pelo Espírito ao deserto, para ser tentado pelo diabo.' },
      { numero: 2, texto: 'E, tendo jejuado quarenta dias e quarenta noites, depois teve fome.' },
    ],
  },
  {
    livro: 'Marcos',
    capitulo: 1,
    versos: [
      { numero: 1, texto: 'Princípio do evangelho de Jesus Cristo, Filho de Deus.' },
      { numero: 2, texto: 'Como está escrito nos profetas: Eis que diante da tua face envio o meu mensageiro, que há de preparar o teu caminho.' },
    ],
  },
  {
    livro: 'Marcos',
    capitulo: 2,
    versos: [
      { numero: 1, texto: 'Alguns dias depois, entrou Jesus novamente em Cafarnaum, e ouviu-se que estava em casa.' },
      { numero: 2, texto: 'E logo se ajuntaram muitos, de modo que não havia mais lugar, nem ao redor da porta; e pregava-lhes a palavra.' },
    ],
  },
  {
    livro: 'Marcos',
    capitulo: 3,
    versos: [
      { numero: 1, texto: 'Entrou Jesus novamente na sinagoga; e estava ali um homem que tinha uma mão seca.' },
      { numero: 2, texto: 'E observavam-no para ver se o curaria no sábado, a fim de o acusarem.' },
    ],
  },
  {
    livro: 'Marcos',
    capitulo: 4,
    versos: [
      { numero: 1, texto: 'Começou Jesus novamente a ensinar à beira do mar; e ajuntou-se uma multidão tão grande junto dele, que entrou numa barca e se assentou nela, no mar; e toda a multidão estava em terra, à beira do mar.' },
      { numero: 2, texto: 'E ensinava-lhes muitas coisas por parábolas, e lhes dizia no seu ensino:' },
    ],
  },
  {
    livro: 'Lucas',
    capitulo: 1,
    versos: [
      { numero: 1, texto: 'Visto que muitos já empreenderam fazer uma narração dos fatos que entre nós se cumpriram,' },
      { numero: 2, texto: 'Conforme nos transmitiram os que desde o princípio foram testemunhas oculares e ministros da palavra,' },
    ],
  },
  {
    livro: 'Lucas',
    capitulo: 2,
    versos: [
      { numero: 1, texto: 'E aconteceu naqueles dias que saiu um decreto de César Augusto, ordenando que se fizesse um recenseamento de todo o mundo habitado.' },
      { numero: 2, texto: 'Este primeiro recenseamento foi feito quando Quirino era governador da Síria.' },
    ],
  },
  {
    livro: 'Lucas',
    capitulo: 3,
    versos: [
      { numero: 1, texto: 'No décimo quinto ano do reinado de Tibério César, sendo Pôncio Pilatos governador da Judeia, e Herodes tetrarca da Galileia, e seu irmão Filipe tetrarca da região de Ituréia e Traconítida, e Lisânias tetrarca de Abilene,' },
      { numero: 2, texto: 'Sendo Anás e Caifás sumos sacerdotes, veio a palavra de Deus a João, filho de Zacarias, no deserto.' },
    ],
  },
  {
    livro: 'Lucas',
    capitulo: 4,
    versos: [
      { numero: 1, texto: 'Jesus, cheio do Espírito Santo, voltou do Jordão e foi levado pelo Espírito ao deserto,' },
      { numero: 2, texto: 'Onde foi tentado pelo diabo durante quarenta dias. E naqueles dias não comeu coisa alguma; e, terminados eles, teve fome.' },
    ],
  },
  {
    livro: 'João',
    capitulo: 1,
    versos: [
      { numero: 1, texto: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.' },
      { numero: 2, texto: 'Ele estava no princípio com Deus.' },
      { numero: 3, texto: 'Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez.' },
    ],
  },
  {
    livro: 'João',
    capitulo: 2,
    versos: [
      { numero: 1, texto: 'Três dias depois houve um casamento em Caná da Galileia; e estava ali a mãe de Jesus.' },
      { numero: 2, texto: 'Jesus foi convidado, e também os seus discípulos, para o casamento.' },
    ],
  },
  {
    livro: 'João',
    capitulo: 3,
    versos: [
      { numero: 1, texto: 'Havia entre os fariseus um homem chamado Nicodemos, príncipe dos judeus.' },
      { numero: 2, texto: 'Este foi ter com Jesus, de noite, e lhe disse: Rabi, bem sabemos que és mestre vindo de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não estiver com ele.' },
    ],
  },
  {
    livro: 'João',
    capitulo: 4,
    versos: [
      { numero: 1, texto: 'Quando, pois, Jesus soube que os fariseus tinham ouvido dizer que ele fazia e batizava mais discípulos do que João' },
      { numero: 2, texto: '(Embora Jesus mesmo não batizasse, mas sim os seus discípulos),' },
    ],
  },
];

/**
 * Buscar texto local de fallback
 */
export function buscarTextoLocal(livro: string, capitulo: number): TextoBiblico | null {
  return TEXTOS_NT_FALLBACK.find(
    (t) => t.livro.toLowerCase() === livro.toLowerCase() && t.capitulo === capitulo
  ) || null;
}

/**
 * Obter todos os livros disponíveis
 */
export function obterLivrosDisponiveis(): string[] {
  return [...new Set(TEXTOS_NT_FALLBACK.map((t) => t.livro))];
}
