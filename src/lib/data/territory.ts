import type { LeaderNode, TerritoryMetric } from "@/lib/types/domain";

export const territoryMetrics: TerritoryMetric[] = [
  {
    name: "Manizales",
    supportPercent: 81,
    voters: 3420,
    leaders: 64,
    employed: 1880,
    unemployed: 620,
    color: "#1ba66a",
    center: [-75.513, 5.067]
  },
  {
    name: "Villamaría",
    supportPercent: 76,
    voters: 1980,
    leaders: 38,
    employed: 1090,
    unemployed: 410,
    color: "#d7b24a",
    center: [-75.511, 5.049]
  },
  {
    name: "Chinchiná",
    supportPercent: 69,
    voters: 1640,
    leaders: 29,
    employed: 920,
    unemployed: 360,
    color: "#10213d",
    center: [-75.606, 4.982]
  },
  {
    name: "Neira",
    supportPercent: 74,
    voters: 940,
    leaders: 21,
    employed: 550,
    unemployed: 180,
    color: "#1ba66a",
    center: [-75.52, 5.163]
  },
  {
    name: "Palestina",
    supportPercent: 72,
    voters: 1280,
    leaders: 26,
    employed: 670,
    unemployed: 220,
    color: "#d7b24a",
    center: [-75.697, 5.024]
  },
  {
    name: "Riosucio",
    supportPercent: 66,
    voters: 1260,
    leaders: 24,
    employed: 660,
    unemployed: 260,
    color: "#10213d",
    center: [-75.704, 5.422]
  },
  {
    name: "Salamina",
    supportPercent: 71,
    voters: 860,
    leaders: 17,
    employed: 430,
    unemployed: 150,
    color: "#1ba66a",
    center: [-75.468, 5.407]
  },
  {
    name: "La Dorada",
    supportPercent: 63,
    voters: 1450,
    leaders: 24,
    employed: 780,
    unemployed: 310,
    color: "#d7b24a",
    center: [-74.662, 5.455]
  },
  {
    name: "Aguadas",
    supportPercent: 68,
    voters: 790,
    leaders: 15,
    employed: 390,
    unemployed: 120,
    color: "#10213d",
    center: [-75.454, 5.607]
  },
  {
    name: "Supía",
    supportPercent: 70,
    voters: 1040,
    leaders: 19,
    employed: 560,
    unemployed: 210,
    color: "#1ba66a",
    center: [-75.653, 5.447]
  }
];

export const leadershipTree: LeaderNode = {
  id: "root",
  name: "Jahir Alvarez",
  title: "Líder Principal",
  municipality: "Caldas",
  influenceScore: 98,
  peopleMobilized: 4860,
  children: [
    {
      id: "north",
      name: "Equipo Norte Manizales",
      title: "Líder secundario",
      municipality: "Manizales",
      influenceScore: 92,
      peopleMobilized: 1260,
      children: [
        {
          id: "north-1",
          name: "Nodo Palermo",
          title: "Barrio",
          municipality: "Manizales",
          influenceScore: 77,
          peopleMobilized: 280,
          children: []
        },
        {
          id: "north-2",
          name: "Nodo Chipre",
          title: "Barrio",
          municipality: "Manizales",
          influenceScore: 73,
          peopleMobilized: 240,
          children: []
        },
        {
          id: "north-3",
          name: "Nodo La Enea",
          title: "Barrio",
          municipality: "Manizales",
          influenceScore: 70,
          peopleMobilized: 210,
          children: []
        }
      ]
    },
    {
      id: "center",
      name: "Centro Villamaría",
      title: "Líder secundario",
      municipality: "Villamaría",
      influenceScore: 89,
      peopleMobilized: 1040,
      children: [
        {
          id: "center-1",
          name: "Nodo Centro",
          title: "Barrio",
          municipality: "Villamaría",
          influenceScore: 71,
          peopleMobilized: 210,
          children: []
        },
        {
          id: "center-2",
          name: "Nodo Termales",
          title: "Barrio",
          municipality: "Villamaría",
          influenceScore: 68,
          peopleMobilized: 170,
          children: []
        }
      ]
    },
    {
      id: "south",
      name: "Sur Chinchiná",
      title: "Líder secundario",
      municipality: "Chinchiná",
      influenceScore: 85,
      peopleMobilized: 1120,
      children: [
        {
          id: "south-1",
          name: "Nodo Centro",
          title: "Barrio",
          municipality: "Chinchiná",
          influenceScore: 69,
          peopleMobilized: 190,
          children: []
        },
        {
          id: "south-2",
          name: "Nodo San Cristóbal",
          title: "Barrio",
          municipality: "Chinchiná",
          influenceScore: 67,
          peopleMobilized: 160,
          children: []
        }
      ]
    },
    {
      id: "rural",
      name: "Riosucio Rural",
      title: "Líder secundario",
      municipality: "Riosucio",
      influenceScore: 82,
      peopleMobilized: 740,
      children: [
        {
          id: "rural-1",
          name: "Nodo El Palmar",
          title: "Vereda",
          municipality: "Riosucio",
          influenceScore: 66,
          peopleMobilized: 180,
          children: []
        },
        {
          id: "rural-2",
          name: "Nodo El Cable",
          title: "Vereda",
          municipality: "Riosucio",
          influenceScore: 64,
          peopleMobilized: 150,
          children: []
        }
      ]
    },
    {
      id: "magdalena",
      name: "Magdalena Medio",
      title: "Líder secundario",
      municipality: "La Dorada",
      influenceScore: 80,
      peopleMobilized: 700,
      children: [
        {
          id: "magdalena-1",
          name: "Nodo La Concordia",
          title: "Barrio",
          municipality: "La Dorada",
          influenceScore: 65,
          peopleMobilized: 160,
          children: []
        },
        {
          id: "magdalena-2",
          name: "Nodo Puerto Triana",
          title: "Barrio",
          municipality: "La Dorada",
          influenceScore: 63,
          peopleMobilized: 145,
          children: []
        }
      ]
    },
    {
      id: "eje-rural",
      name: "Eje Rural Neira",
      title: "Líder secundario",
      municipality: "Neira",
      influenceScore: 78,
      peopleMobilized: 600,
      children: [
        {
          id: "eje-rural-1",
          name: "Nodo La Unión",
          title: "Vereda",
          municipality: "Neira",
          influenceScore: 61,
          peopleMobilized: 140,
          children: []
        },
        {
          id: "eje-rural-2",
          name: "Nodo El Tablazo",
          title: "Vereda",
          municipality: "Neira",
          influenceScore: 59,
          peopleMobilized: 120,
          children: []
        }
      ]
    }
  ]
};

export const territorySummary = [
  { label: "Cobertura activa", value: "91%" },
  { label: "Personas movilizadas", value: "4.860" },
  { label: "Zonas priorizadas", value: "28" },
  { label: "Líderes secundarios", value: "24" }
];
