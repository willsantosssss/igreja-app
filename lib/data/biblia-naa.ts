// Novo Testamento - Versão NAA (Nova Almeida Atualizada)
// 260 capítulos em ordem de leitura

export interface BibliaCapitulo {
  id: string;
  livro: string;
  capitulo: number;
  versao: "NAA" | "NVI";
  texto: string;
  resumo: string;
}

export const capitulos: BibliaCapitulo[] = [
  {
    id: "mt-1",
    livro: "Mateus",
    capitulo: 1,
    versao: "NAA",
    resumo: "Genealogia de Jesus e seu nascimento",
    texto: `Livro da genealogia de Jesus Cristo, filho de Davi, filho de Abraão.

Abraão gerou Isaque; Isaque gerou Jacó; Jacó gerou Judá e seus irmãos; Judá gerou Farés e Zará, de Tamar; Farés gerou Esrom; Esrom gerou Arão; Arão gerou Aminadabe; Aminadabe gerou Naassom; Naassom gerou Salmom; Salmom gerou Boaz, de Raabe; Boaz gerou Obede, de Rute; Obede gerou Jessé; Jessé gerou o rei Davi.

O rei Davi gerou Salomão, da que fora mulher de Urias; Salomão gerou Roboão; Roboão gerou Abias; Abias gerou Asa; Asa gerou Josafá; Josafá gerou Jorão; Jorão gerou Ozias; Ozias gerou Jotão; Jotão gerou Acaz; Acaz gerou Ezequias; Ezequias gerou Manassés; Manassés gerou Amom; Amom gerou Josias; Josias gerou Jeconias e seus irmãos, no tempo da deportação para a Babilônia.

Depois da deportação para a Babilônia, Jeconias gerou Salatiel; Salatiel gerou Zorobabel; Zorobabel gerou Abiude; Abiude gerou Eliacim; Eliacim gerou Azor; Azor gerou Sadoque; Sadoque gerou Aquim; Aquim gerou Eliude; Eliude gerou Eleazar; Eleazar gerou Matã; Matã gerou Jacó; Jacó gerou José, marido de Maria, da qual nasceu Jesus, chamado Cristo.

De sorte que todas as gerações, desde Abraão até Davi, são catorze gerações; e desde Davi até a deportação para a Babilônia, catorze gerações; e desde a deportação para a Babilônia até Cristo, catorze gerações.

Ora, o nascimento de Jesus Cristo foi assim: Estando Maria, sua mãe, desposada com José, antes de se ajuntarem, achou-se que havia concebido do Espírito Santo. Então José, seu marido, sendo justo e não querendo difamá-la, intentou deixá-la secretamente. Mas, pensando ele nisto, eis que lhe apareceu um anjo do Senhor em sonho, dizendo: José, filho de Davi, não temas receber Maria, tua mulher, porque o que nela foi gerado é do Espírito Santo. E ela dará à luz um filho, e chamarás o seu nome JESUS; porque ele salvará o seu povo dos seus pecados.

Tudo isto aconteceu para que se cumprisse o que foi dito pelo Senhor por intermédio do profeta, que diz: Eis que a virgem conceberá e dará à luz um filho, e o chamarão pelo nome de Emanuel, que traduzido é: Deus conosco.

E José, despertando do sono, fez como o anjo do Senhor lhe havia mandado, e recebeu sua mulher; e não a conheceu até que deu à luz seu filho, o primogênito; e chamou o seu nome JESUS.`,
  },
  {
    id: "mt-2",
    livro: "Mateus",
    capitulo: 2,
    versao: "NAA",
    resumo: "Os magos visitam Jesus; fuga para o Egito",
    texto: `Tendo nascido Jesus em Belém da Judeia, nos dias do rei Herodes, eis que uns magos vieram do Oriente a Jerusalém, dizendo: Onde está aquele que nasceu rei dos judeus? Porque vimos a sua estrela no Oriente, e viemos para adorá-lo.

E o rei Herodes, ouvindo isto, perturbou-se, e toda a Jerusalém com ele. E, congregando todos os príncipes dos sacerdotes e os escribas do povo, perguntava-lhes onde havia de nascer o Cristo. E eles lhe disseram: Em Belém da Judeia; porque assim está escrito pelo profeta: E tu, Belém, terra de Judá, de modo nenhum és a menor entre as principais cidades de Judá; porque de ti sairá o Guia que há de apascentar o meu povo Israel.

Então Herodes, chamando secretamente os magos, inquiriu deles com precisão acerca do tempo em que a estrela havia aparecido. E, enviando-os a Belém, disse: Ide, e informai-vos cuidadosamente acerca do menino; e, quando o tiverdes encontrado, participai-mo, para que eu também vá e o adore.

E eles, tendo ouvido o rei, partiram; e eis que a estrela, que tinham visto no Oriente, ia adiante deles, até que, chegando, se deteve sobre o lugar onde estava o menino. E, vendo a estrela, rejubilaram-se com grande alegria. E, entrando na casa, acharam o menino com Maria, sua mãe, e, prostrando-se, o adoraram; e, abrindo seus tesouros, lhe ofereceram dádivas: ouro, incenso e mirra.

E, sendo por revelação em sonho avisados para que não voltassem a Herodes, regressaram por outro caminho à sua terra. E, tendo-se eles ido, eis que um anjo do Senhor apareceu a José em sonho, dizendo: Levanta-te, toma o menino e sua mãe, e foge para o Egito, e fica lá até que eu te avise; porque Herodes há de procurar o menino para o matar.

E ele, levantando-se, tomou de noite o menino e sua mãe, e partiu para o Egito; e ficou lá até à morte de Herodes; para que se cumprisse o que foi dito pelo Senhor por intermédio do profeta, que diz: Do Egito chamei o meu filho.

Então Herodes, vendo que havia sido enganado pelos magos, irritou-se grandemente, e mandou matar todos os meninos que havia em Belém e em todos os seus contornos, de dois anos para baixo, segundo o tempo que havia inquirido dos magos. Então se cumpriu o que foi dito pelo profeta Jeremias, que diz: Uma voz se ouviu em Ramá, choro e grande lamentação: Raquel chorando seus filhos, e não querendo ser consolada, porque já não existem.

Mas, morrendo Herodes, eis que um anjo do Senhor apareceu em sonho a José no Egito, dizendo: Levanta-te, toma o menino e sua mãe, e vai para a terra de Israel; porque já estão mortos os que procuravam a morte do menino.

E ele, levantando-se, tomou o menino e sua mãe, e foi para a terra de Israel. Mas, ouvindo que Arquelau reinava na Judeia em lugar de seu pai Herodes, temeu ir para lá; e, sendo por revelação em sonho avisado, retirou-se para as partes da Galileia. E foi habitar numa cidade chamada Nazaré; para que se cumprisse o que foi dito pelos profetas: Será chamado Nazareno.`,
  },
  // ... Adicionar mais 258 capítulos aqui
  // Por brevidade, apenas 2 capítulos como exemplo
];

export const getCapituloDodia = (): BibliaCapitulo => {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), 0, 1);
  const diff = hoje.getTime() - inicio.getTime();
  const diaDoAno = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Retornar capítulo baseado no dia do ano (0-259)
  const indice = diaDoAno % capitulos.length;
  return capitulos[indice];
};

export const getCapituloById = (id: string): BibliaCapitulo | undefined => {
  return capitulos.find(c => c.id === id);
};

export const getTodosCapitulos = (): BibliaCapitulo[] => {
  return capitulos;
};
