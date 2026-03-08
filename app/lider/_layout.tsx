import { Stack } from "expo-router";

export default function LiderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="membros" />
      <Stack.Screen name="relatorio" />
      <Stack.Screen name="historico" />
      <Stack.Screen name="lembrete" />
      <Stack.Screen name="inscritos-eventos" />
      <Stack.Screen name="anexos" />
      <Stack.Screen name="membros-view" />
      <Stack.Screen name="aniversariantes-view" />
      <Stack.Screen name="eventos-view" />
      <Stack.Screen name="escola-crescimento-view" />
      <Stack.Screen name="adicionar-lider" />
    </Stack>
  );
}
