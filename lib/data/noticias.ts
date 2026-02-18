import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  data: string;
  destaque: boolean;
}

const NOTICIAS_KEY = "@noticias";

const NOTICIAS_INICIAIS: Noticia[] = [
  {
    id: "1",
    titulo: "Bem-vindo à Igreja",
    conteudo: "Somos uma comunidade de fé comprometida com o evangelho e com o crescimento espiritual de nossos membros.",
    data: new Date().toISOString(),
    destaque: true,
  },
];

export async function getNoticias(): Promise<Noticia[]> {
  try {
    const data = await AsyncStorage.getItem(NOTICIAS_KEY);
    if (data) {
      const noticias: Noticia[] = JSON.parse(data);
      return noticias.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }
    return NOTICIAS_INICIAIS;
  } catch {
    return NOTICIAS_INICIAIS;
  }
}

export async function adicionarNoticia(noticia: Omit<Noticia, "id">): Promise<Noticia> {
  try {
    const noticias = await getNoticias();
    const novaNoticia: Noticia = {
      ...noticia,
      id: Date.now().toString(),
    };
    const novaLista = [novaNoticia, ...noticias];
    await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(novaLista));
    return novaNoticia;
  } catch (error) {
    console.error("Erro ao adicionar notícia:", error);
    throw error;
  }
}

export async function atualizarNoticia(id: string, noticia: Partial<Noticia>): Promise<void> {
  try {
    const noticias = await getNoticias();
    const index = noticias.findIndex(n => n.id === id);
    if (index !== -1) {
      noticias[index] = { ...noticias[index], ...noticia };
      await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(noticias));
    }
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    throw error;
  }
}

export async function removerNoticia(id: string): Promise<void> {
  try {
    const noticias = await getNoticias();
    const novaLista = noticias.filter(n => n.id !== id);
    await AsyncStorage.setItem(NOTICIAS_KEY, JSON.stringify(novaLista));
  } catch (error) {
    console.error("Erro ao remover notícia:", error);
    throw error;
  }
}

export async function getNoticiaById(id: string): Promise<Noticia | null> {
  try {
    const noticias = await getNoticias();
    return noticias.find(n => n.id === id) || null;
  } catch {
    return null;
  }
}
