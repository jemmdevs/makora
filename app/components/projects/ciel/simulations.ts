// Definiciones de simulaciones para el proyecto Ciel
// Cada simulación tiene su propio renderer que implementa SimulationRenderer

export interface SimParamDef {
  key: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface SimActionDef {
  id: string;
  label: string;
  accent?: boolean;
}

export interface SimulationDef {
  id: string;
  name: string;
  subtitle: string;
  equations: string[];
  params: SimParamDef[];
  actions: SimActionDef[];
}

export interface SimulationRenderer {
  start(): void;
  stop(): void;
  destroy(): void;
  resize(): void;
  updateParams(params: Record<string, number>): void;
  action(id: string): Record<string, number> | void;
}

export const SIMULATIONS: SimulationDef[] = [
  {
    id: "gravity",
    name: "Gravity",
    subtitle: "N-Body Problem",
    equations: ["F = Gm₁m₂ / (r² + ε²)", "a = F / m"],
    params: [
      { key: "G", symbol: "G", min: 0.5, max: 20, step: 0.1, default: 6 },
      { key: "softening", symbol: "ε", min: 2, max: 50, step: 1, default: 12 },
    ],
    actions: [
      { id: "addBody", label: "Add Body", accent: true },
      { id: "perturb", label: "Perturb" },
      { id: "reset", label: "Reset" },
    ],
  },
  {
    id: "wormhole",
    name: "Wormhole",
    subtitle: "Gravitational Lensing",
    equations: ["θ± = (β ± √(β² + 4θ²_E)) / 2", "μ = |θ/β · dθ/dβ|"],
    params: [
      { key: "einsteinRadius", symbol: "R_E", min: 20, max: 200, step: 1, default: 80 },
      { key: "intensity", symbol: "I", min: 0.5, max: 3, step: 0.05, default: 1.5 },
    ],
    actions: [{ id: "reset", label: "Reset" }],
  },
  {
    id: "dimensions",
    name: "Dimensions",
    subtitle: "4D Geometry",
    equations: ["P₄→₃ = d / (d − w)", "P₃→₂ = d / (d − z)"],
    params: [
      { key: "speedA", symbol: "ωA", min: 0, max: 0.04, step: 0.001, default: 0.008 },
      { key: "speedB", symbol: "ωB", min: 0, max: 0.04, step: 0.001, default: 0.005 },
      { key: "perspective", symbol: "d", min: 1.5, max: 8, step: 0.1, default: 3 },
    ],
    actions: [{ id: "reset", label: "Reset" }],
  },
];

export function getDefaultParams(sim: SimulationDef): Record<string, number> {
  const params: Record<string, number> = {};
  for (const p of sim.params) {
    params[p.key] = p.default;
  }
  return params;
}
