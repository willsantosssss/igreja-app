export interface Celula {
  id: string;
  name: string;
  leader: {
    name: string;
    phone: string;
  };
  schedule: {
    day: string;
    time: string;
  };
  address: {
    street: string;
    neighborhood: string;
    city: string;
  };
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const mockCelulas: Celula[] = [
  {
    id: "1",
    name: "Célula Vida Nova",
    leader: {
      name: "João Silva",
      phone: "+55 11 98765-4321",
    },
    schedule: {
      day: "Terça-feira",
      time: "19:30",
    },
    address: {
      street: "Rua das Flores, 123",
      neighborhood: "Centro",
      city: "São Paulo - SP",
    },
    description: "Célula focada em jovens e adultos, com estudos bíblicos profundos e momentos de comunhão.",
    coordinates: {
      latitude: -23.5505,
      longitude: -46.6333,
    },
  },
  {
    id: "2",
    name: "Célula Esperança",
    leader: {
      name: "Maria Santos",
      phone: "+55 11 99876-5432",
    },
    schedule: {
      day: "Quinta-feira",
      time: "20:00",
    },
    address: {
      street: "Av. Paulista, 456",
      neighborhood: "Bela Vista",
      city: "São Paulo - SP",
    },
    description: "Célula acolhedora para famílias, com atividades para crianças e adultos.",
    coordinates: {
      latitude: -23.5618,
      longitude: -46.6560,
    },
  },
  {
    id: "3",
    name: "Célula Fé e Graça",
    leader: {
      name: "Pedro Oliveira",
      phone: "+55 11 97654-3210",
    },
    schedule: {
      day: "Sexta-feira",
      time: "19:00",
    },
    address: {
      street: "Rua da Paz, 789",
      neighborhood: "Jardim Paulista",
      city: "São Paulo - SP",
    },
    description: "Célula voltada para jovens profissionais, com foco em crescimento espiritual e networking cristão.",
    coordinates: {
      latitude: -23.5629,
      longitude: -46.6544,
    },
  },
  {
    id: "4",
    name: "Célula Amor Perfeito",
    leader: {
      name: "Ana Costa",
      phone: "+55 11 96543-2109",
    },
    schedule: {
      day: "Quarta-feira",
      time: "20:30",
    },
    address: {
      street: "Rua do Amor, 321",
      neighborhood: "Vila Mariana",
      city: "São Paulo - SP",
    },
    description: "Célula para casais, com estudos sobre relacionamentos à luz da Bíblia.",
    coordinates: {
      latitude: -23.5880,
      longitude: -46.6350,
    },
  },
  {
    id: "5",
    name: "Célula Renovo",
    leader: {
      name: "Carlos Mendes",
      phone: "+55 11 95432-1098",
    },
    schedule: {
      day: "Sábado",
      time: "18:00",
    },
    address: {
      street: "Rua Nova Vida, 654",
      neighborhood: "Mooca",
      city: "São Paulo - SP",
    },
    description: "Célula com foco em restauração e cura interior, aberta a todos que buscam renovação espiritual.",
    coordinates: {
      latitude: -23.5489,
      longitude: -46.5982,
    },
  },
];
