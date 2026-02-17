export type EventCategory = "culto" | "reuniao" | "evento-especial" | "retiro" | "conferencia";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  imageUrl?: string;
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Culto de Celebração",
    description: "Culto de adoração e louvor com mensagem edificante. Venha celebrar conosco!",
    date: "2026-02-21",
    time: "19:00",
    location: "Templo Central",
    category: "culto",
  },
  {
    id: "2",
    title: "Reunião de Oração",
    description: "Momento de intercessão e busca pela presença de Deus. Todos são bem-vindos.",
    date: "2026-02-19",
    time: "20:00",
    location: "Sala de Oração",
    category: "reuniao",
  },
  {
    id: "3",
    title: "Retiro Espiritual",
    description: "Três dias de renovação espiritual, adoração e comunhão. Inscrições abertas!",
    date: "2026-03-15",
    time: "08:00",
    location: "Sítio Águas Vivas",
    category: "retiro",
  },
  {
    id: "4",
    title: "Conferência de Jovens",
    description: "Encontro especial para jovens com palestras, louvor e atividades.",
    date: "2026-03-22",
    time: "18:00",
    location: "Auditório Principal",
    category: "conferencia",
  },
  {
    id: "5",
    title: "Culto de Domingo",
    description: "Culto dominical com escola bíblica e pregação da palavra.",
    date: "2026-02-23",
    time: "09:00",
    location: "Templo Central",
    category: "culto",
  },
  {
    id: "6",
    title: "Jantar Comunitário",
    description: "Momento de confraternização e comunhão entre os membros da igreja.",
    date: "2026-02-28",
    time: "19:30",
    location: "Salão Social",
    category: "evento-especial",
  },
];

export const categoryLabels: Record<EventCategory, string> = {
  culto: "Culto",
  reuniao: "Reunião",
  "evento-especial": "Evento Especial",
  retiro: "Retiro",
  conferencia: "Conferência",
};

export const categoryColors: Record<EventCategory, string> = {
  culto: "#6B46C1",
  reuniao: "#10B981",
  "evento-especial": "#F59E0B",
  retiro: "#8B5CF6",
  conferencia: "#EF4444",
};
