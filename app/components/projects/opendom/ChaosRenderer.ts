// Motor de renderizado Canvas 2D para atractores extraños
// Trail fade con overlay, proyección 3D, integración RK4, warm-up

import { Attractor } from "./attractors";

const PARTICLE_COUNT = 2500;
const TRAIL_FADE = 0.035;
const ROTATION_SPEED = 0.002;
const DIVERGENCE_LIMIT = 1000;
const FOV = 500;
const WARMUP_STEPS = 500;

export class ChaosRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: Float64Array;
  private animationId: number | null = null;
  private rotationAngle = 0;
  private width = 0;
  private height = 0;

  attractor: Attractor;
  params: Record<string, number>;

  constructor(
    canvas: HTMLCanvasElement,
    attractor: Attractor,
    params: Record<string, number>
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.attractor = attractor;
    this.params = { ...params };
    this.state = new Float64Array(PARTICLE_COUNT * 3);
    this.resize();
    this.initParticles();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private initParticles() {
    const [cx, cy, cz] = this.attractor.center;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const o = i * 3;
      this.state[o] = cx + (Math.random() - 0.5) * 4;
      this.state[o + 1] = cy + (Math.random() - 0.5) * 4;
      this.state[o + 2] = cz + (Math.random() - 0.5) * 4;
    }

    // Warm-up: converger al atractor antes de pintar
    for (let w = 0; w < WARMUP_STEPS; w++) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        this.step(i);
      }
    }

    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Integración RK4
  private step(i: number) {
    const dt = this.attractor.dt;
    const s = this.state;
    const o = i * 3;
    const x = s[o],
      y = s[o + 1],
      z = s[o + 2];
    const p = this.params;
    const { solve } = this.attractor;

    const [k1x, k1y, k1z] = solve(x, y, z, p);
    const [k2x, k2y, k2z] = solve(
      x + k1x * dt * 0.5,
      y + k1y * dt * 0.5,
      z + k1z * dt * 0.5,
      p
    );
    const [k3x, k3y, k3z] = solve(
      x + k2x * dt * 0.5,
      y + k2y * dt * 0.5,
      z + k2z * dt * 0.5,
      p
    );
    const [k4x, k4y, k4z] = solve(
      x + k3x * dt,
      y + k3y * dt,
      z + k3z * dt,
      p
    );

    const d6 = dt / 6;
    s[o] = x + d6 * (k1x + 2 * k2x + 2 * k3x + k4x);
    s[o + 1] = y + d6 * (k1y + 2 * k2y + 2 * k3y + k4y);
    s[o + 2] = z + d6 * (k1z + 2 * k2z + 2 * k3z + k4z);

    if (
      !isFinite(s[o]) ||
      !isFinite(s[o + 1]) ||
      !isFinite(s[o + 2]) ||
      Math.abs(s[o]) > DIVERGENCE_LIMIT ||
      Math.abs(s[o + 1]) > DIVERGENCE_LIMIT ||
      Math.abs(s[o + 2]) > DIVERGENCE_LIMIT
    ) {
      const [cx, cy, cz] = this.attractor.center;
      s[o] = cx + (Math.random() - 0.5) * 4;
      s[o + 1] = cy + (Math.random() - 0.5) * 4;
      s[o + 2] = cz + (Math.random() - 0.5) * 4;
    }
  }

  // Proyección 3D → 2D con rotación y perspectiva
  private project(
    x: number,
    y: number,
    z: number
  ): [number, number, number] {
    const [cx, cy, cz] = this.attractor.center;
    const lx = x - cx;
    const ly = y - cy;
    const lz = z - cz;

    const cos = Math.cos(this.rotationAngle);
    const sin = Math.sin(this.rotationAngle);
    const rx = lx * cos - lz * sin;
    const ry = ly;
    const rz = lx * sin + lz * cos;

    const s = this.attractor.scale;
    const depth = FOV / (FOV + rz * s * 0.1);
    const sx = rx * s * depth + this.width / 2;
    const sy = -ry * s * depth + this.height / 2;

    return [sx, sy, depth];
  }

  private render = () => {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const s = this.state;

    // Trail fade
    ctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`;
    ctx.fillRect(0, 0, w, h);

    this.rotationAngle += ROTATION_SPEED;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.step(i);

      const o = i * 3;
      const [sx, sy, depth] = this.project(s[o], s[o + 1], s[o + 2]);

      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

      const alpha = Math.min(depth * 0.8, 0.9);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    this.animationId = requestAnimationFrame(this.render);
  };

  start() {
    if (this.animationId !== null) return;
    this.animationId = requestAnimationFrame(this.render);
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  updateParams(params: Record<string, number>) {
    this.params = { ...params };
  }

  setAttractor(attractor: Attractor, params: Record<string, number>) {
    this.attractor = attractor;
    this.params = { ...params };
    this.rotationAngle = 0;
    this.initParticles();
  }

  perturb(amount = 0.01): Record<string, number> {
    const keys = Object.keys(this.params);
    const key = keys[Math.floor(Math.random() * keys.length)];
    this.params[key] += (Math.random() - 0.5) * 2 * amount;
    return { ...this.params };
  }

  destroy() {
    this.stop();
  }
}
