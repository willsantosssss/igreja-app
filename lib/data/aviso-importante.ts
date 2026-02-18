import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AvisoImportante {
  titulo: string;
  mensagem: string;
  ativo: boolean;
  dataCriacao: string;
}

const AVISO_KEY = "@aviso_importante";

const AVISO_PADRAO: AvisoImportante = {
  titulo: "Aviso Importante",
  mensagem: "Inscrições abertas para o retiro espiritual de março! Vagas limitadas.",
  ativo: true,
  dataCriacao: new Date().toISOString(),
};

export async function getAvisoImportante(): Promise<AvisoImportante> {
  try {
    const data = await AsyncStorage.getItem(AVISO_KEY);
    return data ? JSON.parse(data) : AVISO_PADRAO;
  } catch {
    return AVISO_PADRAO;
  }
}

export async function salvarAvisoImportante(aviso: AvisoImportante): Promise<void> {
  try {
    await AsyncStorage.setItem(AVISO_KEY, JSON.stringify(aviso));
  } catch (error) {
    console.error("Erro ao salvar aviso importante:", error);
    throw error;
  }
}

export async function limparAvisoImportante(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AVISO_KEY);
  } catch (error) {
    console.error("Erro ao limpar aviso importante:", error);
    throw error;
  }
}
