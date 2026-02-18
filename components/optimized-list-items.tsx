/**
 * Componentes memoizados para itens de lista
 * Evitam re-renders desnecessários em listas longas
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

// Componente memoizado para item de evento
export const EventoItem = memo(({ 
  evento, 
  onPress 
}: { 
  evento: any; 
  onPress: () => void;
}) => {
  const colors = useColors();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-2xl p-4 border border-border"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">{evento.name}</Text>
          <Text className="text-sm text-muted">{evento.date} • {evento.time}</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders
  return prevProps.evento.id === nextProps.evento.id;
});

EventoItem.displayName = 'EventoItem';

// Componente memoizado para item de aniversariante
export const AniversarianteItem = memo(({ 
  pessoa, 
  index 
}: { 
  pessoa: any; 
  index: number;
}) => {
  const colors = useColors();
  
  return (
    <View
      className="bg-surface rounded-2xl p-4 flex-row items-center gap-3 border border-border"
    >
      <View
        style={{
          backgroundColor: colors.primary + '20',
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20 }}>🎂</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground">{pessoa.name}</Text>
        <Text className="text-sm text-muted">{pessoa.birthDate}</Text>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.pessoa.name === nextProps.pessoa.name && 
         prevProps.index === nextProps.index;
});

AniversarianteItem.displayName = 'AniversarianteItem';

// Componente memoizado para item de pedido de oração
export const PedidoOracaoItem = memo(({ 
  pedido, 
  onPress 
}: { 
  pedido: any; 
  onPress: () => void;
}) => {
  const colors = useColors();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-2xl p-4 border border-border gap-2"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">{pedido.author}</Text>
          <Text className="text-sm text-muted">{pedido.date}</Text>
        </View>
      </View>
      <Text className="text-sm text-foreground" numberOfLines={3}>
        {pedido.request}
      </Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.pedido.id === nextProps.pedido.id;
});

PedidoOracaoItem.displayName = 'PedidoOracaoItem';

// Componente memoizado para item de notícia
export const NoticiaItem = memo(({ 
  noticia, 
  onPress 
}: { 
  noticia: any; 
  onPress: () => void;
}) => {
  const colors = useColors();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-2xl overflow-hidden border border-border"
    >
      <View className="p-4 gap-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl">{noticia.imageEmoji}</Text>
          <Text className="text-xs font-semibold text-primary uppercase">
            {noticia.category}
          </Text>
        </View>
        <Text className="text-base font-bold text-foreground">{noticia.title}</Text>
        <Text className="text-sm text-muted" numberOfLines={2}>
          {noticia.summary}
        </Text>
        <Text className="text-xs text-muted">{noticia.date}</Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.noticia.id === nextProps.noticia.id;
});

NoticiaItem.displayName = 'NoticiaItem';
