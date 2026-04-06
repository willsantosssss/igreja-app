import { View, Text, TextInput, TouchableOpacity, Platform, Modal as RNModal } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface DateConfigModalProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function DateConfigModal({
  visible,
  value,
  onChangeText,
  onClose,
  onSave,
}: DateConfigModalProps) {
  const colors = useColors();

  if (!visible) return null;

  // Para web, usar um overlay com posicionamento absoluto
  if (Platform.OS === 'web') {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        } as any}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 24,
            width: 320,
            gap: 16,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          } as any}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground }}>
            Configurar Data de Início
          </Text>
          <TextInput
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.muted}
            value={value}
            onChangeText={onChangeText}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: colors.foreground,
              fontSize: 16,
              fontFamily: 'system-ui',
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: colors.background, fontWeight: '600' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Para app nativo, usar Modal do React Native
  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
        <View className="bg-white rounded-2xl p-6 w-80 gap-4">
          <Text className="text-xl font-bold text-foreground">Configurar Data de Início</Text>
          <TextInput
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#999"
            value={value}
            onChangeText={onChangeText}
            className="border border-border rounded-lg px-3 py-2 text-foreground"
          />
          <View className="flex-row gap-2 justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 rounded-lg border border-border"
            >
              <Text className="text-foreground font-semibold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              className="px-4 py-2 rounded-lg bg-primary"
            >
              <Text className="text-white font-semibold">Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
