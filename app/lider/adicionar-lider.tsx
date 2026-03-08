import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider } from '@/lib/data/lideres';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

export default function AdicionarLiderScreen() {
  const colors = useColors();
  const [lider, setLider] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [carregandoInicial, setCarregandoInicial] = useState(true);

  const createLiderMutation = trpc.lideres.create.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
    }
    setCarregandoInicial(false);
  };

  const validarFormulario = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }
    if (!telefone.trim()) {
      Alert.alert('Erro', 'Telefone é obrigatório');
      return false;
    }
    if (!senha.trim()) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return false;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }
    // Validar email básico
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }
    return true;
  };

  const handleAdicionarLider = async () => {
    if (!validarFormulario() || !lider) return;

    setCarregando(true);
    try {
      // 1. Criar conta de usuário
      const signupResult = await signupMutation.mutateAsync({
        email,
        password: senha,
        name: nome,
      });

      console.log('[AdicionarLider] Signup success:', signupResult);

      // 2. Criar perfil de líder
      const liderResult = await createLiderMutation.mutateAsync({
        userId: signupResult.userId,
        nome,
        celula: lider.celula,
        telefone,
        email,
        ativo: 1,
      });

      console.log('[AdicionarLider] Lider created:', liderResult);

      Alert.alert(
        'Sucesso',
        `Novo líder "${nome}" criado com sucesso na célula "${lider.celula}"!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[AdicionarLider] Error:', error);
      Alert.alert('Erro', error.message || 'Erro ao criar novo líder');
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoInicial) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 gap-2 mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Novo Líder</Text>
            <Text className="text-sm text-muted">Adicionar líder à célula</Text>
          </View>
          <BackButton />
        </View>

        {/* Info Box */}
        <View className="px-4 mb-6">
          <View
            style={{
              backgroundColor: colors.primary + '10',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.primary + '20',
            }}
          >
            <Text className="text-sm text-foreground">
              <Text className="font-semibold">Célula: </Text>
              {lider?.celula}
            </Text>
            <Text className="text-xs text-muted mt-2">
              O novo líder terá acesso aos mesmos dados e relatórios da célula.
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="px-4 gap-4">
          {/* Nome */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Nome Completo *</Text>
            <TextInput
              className="border border-border rounded-lg p-3 text-foreground bg-surface"
              placeholder="Ex: João Silva"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
              editable={!carregando}
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Email *</Text>
            <TextInput
              className="border border-border rounded-lg p-3 text-foreground bg-surface"
              placeholder="Ex: joao@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!carregando}
            />
          </View>

          {/* Telefone */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Telefone *</Text>
            <TextInput
              className="border border-border rounded-lg p-3 text-foreground bg-surface"
              placeholder="Ex: (64) 99999-9999"
              placeholderTextColor="#999"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
              editable={!carregando}
            />
          </View>

          {/* Senha */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Senha *</Text>
            <TextInput
              className="border border-border rounded-lg p-3 text-foreground bg-surface"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#999"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!carregando}
            />
          </View>

          {/* Confirmar Senha */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Confirmar Senha *</Text>
            <TextInput
              className="border border-border rounded-lg p-3 text-foreground bg-surface"
              placeholder="Repita a senha"
              placeholderTextColor="#999"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              editable={!carregando}
            />
          </View>

          {/* Botão Criar */}
          <TouchableOpacity
            onPress={handleAdicionarLider}
            disabled={carregando}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              marginTop: 8,
              opacity: carregando ? 0.6 : 1,
            }}
          >
            <View className="flex-row items-center justify-center gap-2">
              {carregando && <ActivityIndicator color="#fff" />}
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {carregando ? 'Criando...' : 'Criar Novo Líder'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Aviso */}
          <View className="bg-warning/10 rounded-lg p-3 border border-warning/20">
            <Text className="text-xs text-warning font-semibold mb-1">⚠️ Importante</Text>
            <Text className="text-xs text-foreground">
              O novo líder poderá acessar todos os dados e relatórios da célula. Compartilhe a senha de forma segura.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
