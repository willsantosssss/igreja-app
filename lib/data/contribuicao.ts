import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DadosContribuicao {
  pixKey: string;
  pixType: 'email' | 'cpf' | 'cnpj' | 'telefone' | 'aleatoria';
  bank: string;
  agency: string;
  account: string;
  cnpj: string;
  titular: string;
  mensagemMotivacional: string;
  versiculoRef: string;
  mensagemAgradecimento: string;
  tiposContribuicao: TipoContribuicao[];
}

export interface TipoContribuicao {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  ativo: boolean;
}

const DADOS_INICIAIS: DadosContribuicao = {
  pixKey: 'igreja@connect.com.br',
  pixType: 'email',
  bank: 'Banco do Brasil',
  agency: '1234-5',
  account: '67890-1',
  cnpj: '12.345.678/0001-90',
  titular: '2ª IEQ Rondonópolis',
  mensagemMotivacional: '"Cada um contribua segundo propôs no seu coração"',
  versiculoRef: '2 Coríntios 9:7',
  mensagemAgradecimento: 'Sua contribuição ajuda a manter o trabalho da igreja e impactar vidas para o Reino de Deus.',
  tiposContribuicao: [
    { id: '1', nome: 'Dízimo', emoji: '💰', descricao: '10% da sua renda devolvida a Deus como reconhecimento de Sua provisão.', ativo: true },
    { id: '2', nome: 'Oferta', emoji: '🎁', descricao: 'Contribuição voluntária além do dízimo para apoiar projetos e necessidades da igreja.', ativo: true },
    { id: '3', nome: 'Missões', emoji: '🌍', descricao: 'Apoio financeiro para o trabalho missionário e evangelístico.', ativo: true },
    { id: '4', nome: 'Projetos Especiais', emoji: '🏗️', descricao: 'Contribuição para obras, reformas e projetos específicos da igreja.', ativo: true },
  ],
};

const CONTRIBUICAO_KEY = '@contribuicao_dados';
const CONTRIBUICAO_INIT_KEY = '@contribuicao_init';

export async function getDadosContribuicao(): Promise<DadosContribuicao> {
  try {
    const init = await AsyncStorage.getItem(CONTRIBUICAO_INIT_KEY);
    if (!init) {
      await AsyncStorage.setItem(CONTRIBUICAO_KEY, JSON.stringify(DADOS_INICIAIS));
      await AsyncStorage.setItem(CONTRIBUICAO_INIT_KEY, 'true');
      return DADOS_INICIAIS;
    }
    const data = await AsyncStorage.getItem(CONTRIBUICAO_KEY);
    return data ? JSON.parse(data) : DADOS_INICIAIS;
  } catch {
    return DADOS_INICIAIS;
  }
}

export async function salvarDadosContribuicao(dados: DadosContribuicao): Promise<void> {
  await AsyncStorage.setItem(CONTRIBUICAO_KEY, JSON.stringify(dados));
}

export async function adicionarTipoContribuicao(tipo: Omit<TipoContribuicao, 'id'>): Promise<void> {
  const dados = await getDadosContribuicao();
  dados.tiposContribuicao.push({ ...tipo, id: Date.now().toString() });
  await salvarDadosContribuicao(dados);
}

export async function removerTipoContribuicao(id: string): Promise<void> {
  const dados = await getDadosContribuicao();
  dados.tiposContribuicao = dados.tiposContribuicao.filter(t => t.id !== id);
  await salvarDadosContribuicao(dados);
}
