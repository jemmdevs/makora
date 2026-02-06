// Definiciones matemáticas de atractores extraños (sistemas caóticos)

export interface AttractorParamDef {
  key: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface Attractor {
  id: string;
  name: string;
  equations: string[];
  params: AttractorParamDef[];
  solve: (
    x: number,
    y: number,
    z: number,
    p: Record<string, number>
  ) => [number, number, number];
  scale: number;
  center: [number, number, number];
  dt: number;
  bifurcation: {
    paramKey: string;
    range: [number, number];
    component: 0 | 1 | 2;
  };
}

export const ATTRACTORS: Attractor[] = [
  {
    id: "lorenz",
    name: "Lorenz",
    equations: ["dx/dt = σ(y − x)", "dy/dt = x(ρ − z) − y", "dz/dt = xy − βz"],
    params: [
      { key: "sigma", symbol: "σ", min: 0, max: 50, step: 0.1, default: 10 },
      { key: "rho", symbol: "ρ", min: 0, max: 50, step: 0.1, default: 28 },
      { key: "beta", symbol: "β", min: 0, max: 10, step: 0.01, default: 8 / 3 },
    ],
    solve: (x, y, z, p) => [
      p.sigma * (y - x),
      x * (p.rho - z) - y,
      x * y - p.beta * z,
    ],
    scale: 8,
    center: [0, 0, 25],
    dt: 0.005,
    bifurcation: { paramKey: "rho", range: [0, 200], component: 2 },
  },
  {
    id: "aizawa",
    name: "Aizawa",
    equations: [
      "dx/dt = (z − b)x − dy",
      "dy/dt = dx + (z − b)y",
      "dz/dt = c + az − z³/3 − (x²+y²)(1+ez) + fzx³",
    ],
    params: [
      { key: "a", symbol: "a", min: 0, max: 2, step: 0.01, default: 0.95 },
      { key: "b", symbol: "b", min: 0, max: 2, step: 0.01, default: 0.7 },
      { key: "c", symbol: "c", min: 0, max: 2, step: 0.01, default: 0.6 },
      { key: "d", symbol: "d", min: 0, max: 5, step: 0.01, default: 3.5 },
      { key: "e", symbol: "e", min: 0, max: 1, step: 0.01, default: 0.25 },
      { key: "f", symbol: "f", min: 0, max: 1, step: 0.01, default: 0.1 },
    ],
    solve: (x, y, z, p) => [
      (z - p.b) * x - p.d * y,
      p.d * x + (z - p.b) * y,
      p.c +
      p.a * z -
      (z * z * z) / 3 -
      (x * x + y * y) * (1 + p.e * z) +
      p.f * z * x * x * x,
    ],
    scale: 150,
    center: [0, 0, 0],
    dt: 0.005,
    bifurcation: { paramKey: "a", range: [0.4, 1.5], component: 2 },
  },
  {
    id: "thomas",
    name: "Thomas",
    equations: [
      "dx/dt = sin(y) − bx",
      "dy/dt = sin(z) − by",
      "dz/dt = sin(x) − bz",
    ],
    params: [
      { key: "b", symbol: "b", min: 0.05, max: 0.5, step: 0.001, default: 0.208186 },
    ],
    solve: (x, y, z, p) => [
      Math.sin(y) - p.b * x,
      Math.sin(z) - p.b * y,
      Math.sin(x) - p.b * z,
    ],
    scale: 80,
    center: [0, 0, 0],
    dt: 0.05,
    bifurcation: { paramKey: "b", range: [0.05, 0.35], component: 0 },
  },
];

export function getDefaultParams(attractor: Attractor): Record<string, number> {
  const params: Record<string, number> = {};
  for (const p of attractor.params) {
    params[p.key] = p.default;
  }
  return params;
}
