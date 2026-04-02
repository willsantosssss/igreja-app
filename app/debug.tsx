import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function DebugScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"logs" | "health" | "test">("logs");
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | "ERROR" | "INFO" | "WARN" | "DEBUG">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Queries
  const healthQuery = trpc.debug.health.useQuery();
  const logsQuery = trpc.debug.logs.useQuery({
    level: selectedLevel === "ALL" ? undefined : selectedLevel,
    category: selectedCategory || undefined,
    limit: 100,
  });
  const statsQuery = trpc.debug.logStats.useQuery();

  // Mutations
  const clearLogsMutation = trpc.debug.clearLogs.useMutation({
    onSuccess: () => {
      Alert.alert("Sucesso", "Logs limpos com sucesso");
      logsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("Erro", error.message);
    },
  });

  const testDatabaseMutation = trpc.debug.testDatabase.useMutation({
    onSuccess: (data) => {
      Alert.alert("Teste de Banco de Dados", JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      Alert.alert("Erro", error.message);
    },
  });

  const testAuthMutation = trpc.debug.testAuth.useMutation({
    onSuccess: (data) => {
      Alert.alert("Teste de Autenticação", JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      Alert.alert("Erro", error.message);
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      logsQuery.refetch();
      statsQuery.refetch();
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const renderLogLevel = (level: string) => {
    const levelColors: Record<string, string> = {
      ERROR: colors.error,
      WARN: colors.warning,
      INFO: colors.primary,
      DEBUG: colors.muted,
    };
    return levelColors[level] || colors.foreground;
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20, color: colors.primary }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>
            Debug Console
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-border">
          {(["logs", "health", "test"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: activeTab === tab ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: activeTab === tab ? colors.primary : colors.muted,
                  fontWeight: activeTab === tab ? "600" : "400",
                }}
              >
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {activeTab === "logs" && (
            <View>
              {/* Filters */}
              <View className="mb-4 gap-2">
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>Filtrar por Nível:</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {(["ALL", "ERROR", "WARN", "INFO", "DEBUG"] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setSelectedLevel(level)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: selectedLevel === level ? colors.primary : colors.surface,
                      }}
                    >
                      <Text
                        style={{
                          color: selectedLevel === level ? colors.background : colors.foreground,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Stats */}
              {statsQuery.data && (
                <View className="mb-4 p-3 bg-surface rounded-lg border border-border">
                  <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                    Estatísticas
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    Total: {statsQuery.data.stats.total}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    Erros: {statsQuery.data.stats.byLevel.ERROR}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    Avisos: {statsQuery.data.stats.byLevel.WARN}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    Info: {statsQuery.data.stats.byLevel.INFO}
                  </Text>
                </View>
              )}

              {/* Clear Logs Button */}
              <TouchableOpacity
                onPress={() => clearLogsMutation.mutate()}
                disabled={clearLogsMutation.isPending}
                style={{
                  backgroundColor: colors.error,
                  paddingVertical: 10,
                  borderRadius: 6,
                  marginBottom: 12,
                  opacity: clearLogsMutation.isPending ? 0.6 : 1,
                }}
              >
                <Text style={{ color: colors.background, textAlign: "center", fontWeight: "600" }}>
                  {clearLogsMutation.isPending ? "Limpando..." : "Limpar Logs"}
                </Text>
              </TouchableOpacity>

              {/* Logs */}
              {logsQuery.isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : logsQuery.data?.logs && logsQuery.data.logs.length > 0 ? (
                <View className="gap-2">
                  {logsQuery.data.logs.map((log, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: colors.surface,
                        borderLeftWidth: 3,
                        borderLeftColor: renderLogLevel(log.level),
                        padding: 10,
                        borderRadius: 4,
                      }}
                    >
                      <View className="flex-row justify-between mb-1">
                        <Text
                          style={{
                            color: renderLogLevel(log.level),
                            fontWeight: "600",
                            fontSize: 12,
                          }}
                        >
                          [{log.level}] {log.category}
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 10 }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </Text>
                      </View>
                      <Text style={{ color: colors.foreground, fontSize: 12, marginBottom: 4 }}>
                        {log.message}
                      </Text>
                      {log.data && (
                        <Text style={{ color: colors.muted, fontSize: 10 }}>
                          {JSON.stringify(log.data, null, 2)}
                        </Text>
                      )}
                      {log.error && (
                        <Text style={{ color: colors.error, fontSize: 10 }}>
                          Error: {log.error}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                  Nenhum log encontrado
                </Text>
              )}
            </View>
          )}

          {activeTab === "health" && (
            <View>
              {healthQuery.isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : healthQuery.data ? (
                <View className="gap-4">
                  <View className="p-4 bg-surface rounded-lg border border-border">
                    <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                      Status do Sistema
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                      Status: {healthQuery.data.status}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                      Uptime: {Math.round(healthQuery.data.uptime)}s
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                      Memória: {Math.round(healthQuery.data.memory.heapUsed / 1024 / 1024)}MB /
                      {Math.round(healthQuery.data.memory.heapTotal / 1024 / 1024)}MB
                    </Text>
                  </View>

                  <View className="p-4 bg-surface rounded-lg border border-border">
                    <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                      Variáveis de Ambiente
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                      NODE_ENV: {healthQuery.data.environment.NODE_ENV}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                      DATABASE_URL: {healthQuery.data.environment.DATABASE_URL}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
                      JWT_SECRET: {healthQuery.data.environment.JWT_SECRET}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      CUSTOM_JWT_SECRET: {healthQuery.data.environment.CUSTOM_JWT_SECRET}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => healthQuery.refetch()}
                    style={{
                      backgroundColor: colors.primary,
                      paddingVertical: 10,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: colors.background, textAlign: "center", fontWeight: "600" }}>
                      Atualizar
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={{ color: colors.error }}>Erro ao carregar status</Text>
              )}
            </View>
          )}

          {activeTab === "test" && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => testDatabaseMutation.mutate()}
                disabled={testDatabaseMutation.isPending}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 6,
                  opacity: testDatabaseMutation.isPending ? 0.6 : 1,
                }}
              >
                <Text style={{ color: colors.background, textAlign: "center", fontWeight: "600" }}>
                  {testDatabaseMutation.isPending ? "Testando..." : "Testar Banco de Dados"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  testAuthMutation.mutate({
                    email: "test@example.com",
                    password: "test123",
                  })
                }
                disabled={testAuthMutation.isPending}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 6,
                  opacity: testAuthMutation.isPending ? 0.6 : 1,
                }}
              >
                <Text style={{ color: colors.background, textAlign: "center", fontWeight: "600" }}>
                  {testAuthMutation.isPending ? "Testando..." : "Testar Autenticação"}
                </Text>
              </TouchableOpacity>

              <View className="p-4 bg-surface rounded-lg border border-border">
                <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                  Instruções
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
                  Use esta tela para diagnosticar problemas:{"\n\n"}
                  • Logs: Visualize todos os logs do servidor em tempo real{"\n"}
                  • Health: Verifique o status do sistema{"\n"}
                  • Test: Execute testes de conectividade
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
