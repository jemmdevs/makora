// Cálculo del diagrama de bifurcación
// Barre un parámetro del atractor y recoge los máximos locales de una coordenada

import { Attractor, getDefaultParams } from "./attractors";

export interface BifurcationPoint {
  param: number;
  value: number;
}

const STEPS = 800;
const WARMUP = 2000;
const COLLECT = 2000;

export function computeBifurcation(attractor: Attractor): BifurcationPoint[] {
  const { bifurcation: bif, solve, dt, center } = attractor;
  const baseParams = getDefaultParams(attractor);
  const { paramKey, range, component } = bif;
  const [pMin, pMax] = range;
  const dp = (pMax - pMin) / STEPS;
  const points: BifurcationPoint[] = [];

  for (let s = 0; s <= STEPS; s++) {
    const paramVal = pMin + s * dp;
    const p = { ...baseParams, [paramKey]: paramVal };

    let x = center[0] + (Math.random() - 0.5) * 0.1;
    let y = center[1] + (Math.random() - 0.5) * 0.1;
    let z = center[2] + (Math.random() - 0.5) * 0.1;

    const step = () => {
      const [k1x, k1y, k1z] = solve(x, y, z, p);
      const [k2x, k2y, k2z] = solve(
        x + k1x * dt * 0.5, y + k1y * dt * 0.5, z + k1z * dt * 0.5, p
      );
      const [k3x, k3y, k3z] = solve(
        x + k2x * dt * 0.5, y + k2y * dt * 0.5, z + k2z * dt * 0.5, p
      );
      const [k4x, k4y, k4z] = solve(
        x + k3x * dt, y + k3y * dt, z + k3z * dt, p
      );
      const d6 = dt / 6;
      x += d6 * (k1x + 2 * k2x + 2 * k3x + k4x);
      y += d6 * (k1y + 2 * k2y + 2 * k3y + k4y);
      z += d6 * (k1z + 2 * k2z + 2 * k3z + k4z);
    };

    // Warm-up: convergencia al atractor
    let diverged = false;
    for (let i = 0; i < WARMUP; i++) {
      step();
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
        diverged = true;
        break;
      }
    }
    if (diverged) continue;

    // Recoger máximos locales del componente elegido
    const val = () => (component === 0 ? x : component === 1 ? y : z);
    let prev2 = val();
    step();
    let prev1 = val();

    for (let i = 2; i < COLLECT; i++) {
      step();
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) break;
      const v = val();
      if (prev1 > prev2 && prev1 > v) {
        points.push({ param: paramVal, value: prev1 });
      }
      prev2 = prev1;
      prev1 = v;
    }
  }

  return points;
}
