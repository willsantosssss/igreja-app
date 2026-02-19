import AsyncStorage from '@react-native-async-storage/async-storage';

const LIDERES_KEY = '@lideres_celulas';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000';

/**
 * Migra líderes do AsyncStorage para o banco de dados via API
 * Deve ser chamada uma única vez durante a inicialização
 */
export async function migrarLideresParaBancoDados() {
  try {
    console.log('[Migration] Iniciando migração de líderes...');
    
    // Buscar líderes do AsyncStorage
    const data = await AsyncStorage.getItem(LIDERES_KEY);
    if (!data) {
      console.log('[Migration] Nenhum líder encontrado no AsyncStorage');
      return;
    }

    const lideresLocais = JSON.parse(data);
    console.log(`[Migration] Encontrados ${lideresLocais.length} líderes no AsyncStorage`);

    // Para cada líder local, criar no banco de dados via API
    for (const liderLocal of lideresLocais) {
      try {
        // Usar o ID do AsyncStorage como userId (ou 0 se não tiver)
        const userId = parseInt(liderLocal.id) || 0;
        
        // Chamar API para criar líder no banco de dados
        const response = await fetch(`${API_URL}/api/trpc/lideres.create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            json: {
              userId,
              nome: liderLocal.nome || 'Sem nome',
              celula: liderLocal.celula || 'Sem célula',
              telefone: liderLocal.telefone || '',
              email: liderLocal.email || undefined,
              ativo: 1,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log(`[Migration] ✅ Líder "${liderLocal.nome}" migrado com sucesso`);
      } catch (error: any) {
        console.log(`[Migration] ⚠️ Erro ao migrar líder "${liderLocal.nome}":`, error.message);
      }
    }

    // Após migração bem-sucedida, limpar AsyncStorage
    await AsyncStorage.removeItem(LIDERES_KEY);
    console.log('[Migration] ✅ Migração concluída! AsyncStorage limpo.');
  } catch (error: any) {
    console.log('[Migration] ❌ Erro durante migração:', error.message);
  }
}

/**
 * Verifica se há líderes no AsyncStorage que precisam ser migrados
 */
export async function temLideresParaMigrar(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(LIDERES_KEY);
    return !!data;
  } catch {
    return false;
  }
}
