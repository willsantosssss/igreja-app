import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="aniversariantes" />
      <Stack.Screen name="lideres" />
      <Stack.Screen name="relatorios" />
      <Stack.Screen name="eventos" />
      <Stack.Screen name="inscricoes-eventos" />
      <Stack.Screen name="oracao" />
      <Stack.Screen name="celulas" />
      <Stack.Screen name="contribuicao" />
      <Stack.Screen name="aniversariantes-gerenciar" />
      <Stack.Screen name="aviso-importante" />
      <Stack.Screen name="noticias" />
      <Stack.Screen name="anexos" />
      <Stack.Screen name="pagamentos-eventos" />
    </Stack>
  );
}
