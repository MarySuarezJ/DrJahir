import type { TerritoryMetric } from "@/lib/types/domain";

export type TerritoryFeatureProperties = Pick<TerritoryMetric, "name" | "supportPercent" | "voters" | "leaders" | "employed" | "unemployed" | "color">;

type PolygonCoordinates = Array<Array<[number, number]>>;

type TerritoryFeature = {
  type: "Feature";
  properties: TerritoryFeatureProperties;
  geometry: {
    type: "Polygon";
    coordinates: PolygonCoordinates;
  };
};

type TerritoryFeatureCollection = {
  type: "FeatureCollection";
  features: TerritoryFeature[];
};

export const territoryGeoJSON: TerritoryFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Manizales",
        supportPercent: 81,
        voters: 3420,
        leaders: 64,
        employed: 1880,
        unemployed: 620,
        color: "#1ba66a"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.62, 5.18], [-75.46, 5.18], [-75.42, 5.03], [-75.55, 4.96], [-75.67, 5.07], [-75.62, 5.18]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Villamaría",
        supportPercent: 76,
        voters: 1980,
        leaders: 38,
        employed: 1090,
        unemployed: 410,
        color: "#d7b24a"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.58, 5.08], [-75.46, 5.08], [-75.43, 4.96], [-75.56, 4.93], [-75.63, 4.99], [-75.58, 5.08]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Chinchiná",
        supportPercent: 69,
        voters: 1640,
        leaders: 29,
        employed: 920,
        unemployed: 360,
        color: "#10213d"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.69, 5.02], [-75.54, 5.02], [-75.51, 4.90], [-75.66, 4.87], [-75.73, 4.95], [-75.69, 5.02]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Neira",
        supportPercent: 74,
        voters: 940,
        leaders: 21,
        employed: 550,
        unemployed: 180,
        color: "#1ba66a"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.61, 5.29], [-75.46, 5.29], [-75.42, 5.18], [-75.55, 5.13], [-75.65, 5.19], [-75.61, 5.29]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Palestina",
        supportPercent: 72,
        voters: 1280,
        leaders: 26,
        employed: 670,
        unemployed: 220,
        color: "#d7b24a"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.79, 5.15], [-75.62, 5.15], [-75.60, 5.01], [-75.73, 4.97], [-75.81, 5.05], [-75.79, 5.15]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Riosucio",
        supportPercent: 66,
        voters: 1260,
        leaders: 24,
        employed: 660,
        unemployed: 260,
        color: "#10213d"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.79, 5.49], [-75.63, 5.49], [-75.60, 5.37], [-75.72, 5.33], [-75.82, 5.41], [-75.79, 5.49]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Salamina",
        supportPercent: 71,
        voters: 860,
        leaders: 17,
        employed: 430,
        unemployed: 150,
        color: "#1ba66a"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.55, 5.50], [-75.42, 5.50], [-75.39, 5.35], [-75.49, 5.32], [-75.58, 5.40], [-75.55, 5.50]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "La Dorada",
        supportPercent: 63,
        voters: 1450,
        leaders: 24,
        employed: 780,
        unemployed: 310,
        color: "#d7b24a"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-74.75, 5.58], [-74.58, 5.58], [-74.55, 5.42], [-74.68, 5.38], [-74.78, 5.46], [-74.75, 5.58]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Aguadas",
        supportPercent: 68,
        voters: 790,
        leaders: 15,
        employed: 390,
        unemployed: 120,
        color: "#10213d"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.55, 5.71], [-75.40, 5.71], [-75.38, 5.55], [-75.50, 5.51], [-75.59, 5.60], [-75.55, 5.71]]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Supía",
        supportPercent: 70,
        voters: 1040,
        leaders: 19,
        employed: 560,
        unemployed: 210,
        color: "#1ba66a"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[-75.72, 5.55], [-75.58, 5.55], [-75.55, 5.42], [-75.66, 5.38], [-75.76, 5.46], [-75.72, 5.55]]]
      }
    }
  ]
};
