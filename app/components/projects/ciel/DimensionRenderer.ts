// Motor Canvas 2D para visualización de geometría 4D
// Tesseract (hipercubo) con rotación en planos 4D, doble proyección perspectiva
// Trail fade para estelas rotacionales

import { SimulationRenderer } from "./simulations";

const TRAIL_FADE = 0.055;
const VERTEX_RADIUS = 3;
const VERTEX_GLOW = 14;
const EDGE_WIDTH = 1.2;
const TAU = Math.PI * 2;

// Tesseract: 16 vértices (combinaciones de ±1 en 4D)
const VERTICES_4D: [number, number, number, number][] = [];
for (let i = 0; i < 16; i++) {
  VERTICES_4D.push([
    (i & 1) ? 1 : -1,
    (i & 2) ? 1 : -1,
    (i & 4) ? 1 : -1,
    (i & 8) ? 1 : -1,
  ]);
}

// 32 aristas: conectan vértices que difieren en exactamente 1 coordenada
const EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    const diff = i ^ j;
    if (diff && !(diff & (diff - 1))) {
      EDGES.push([i, j]);
    }
  }
}

interface Projected {
  sx: number;
  sy: number;
  depth: number;
}

export class DimensionRenderer implements SimulationRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private animationId: number | null = null;

  private angleA = 0; // Rotación plano XW
  private angleB = 0; // Rotación plano YZ

  params: Record<string, number>;

  constructor(canvas: HTMLCanvasElement, params: Record<string, number>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.params = { ...params };
    this.resize();
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

  // Rotar vértice 4D y proyectar a 2D
  private projectAll(): Projected[] {
    const d4 = this.params.perspective + 2;
    const d3 = 5;
    const scale = Math.min(this.width, this.height) * 0.18;

    const cosA = Math.cos(this.angleA);
    const sinA = Math.sin(this.angleA);
    const cosB = Math.cos(this.angleB);
    const sinB = Math.sin(this.angleB);

    // Rotación lenta adicional en XZ (acoplada, no parametrizada)
    const angleC = this.angleA * 0.3;
    const cosC = Math.cos(angleC);
    const sinC = Math.sin(angleC);

    const cx = this.width / 2;
    const cy = this.height / 2;

    return VERTICES_4D.map((v) => {
      let [x, y, z, w] = v;

      // Rotación XW (la rotación "4D" principal)
      let nx = x * cosA - w * sinA;
      let nw = x * sinA + w * cosA;
      x = nx;
      w = nw;

      // Rotación YZ
      let ny = y * cosB - z * sinB;
      let nz = y * sinB + z * cosB;
      y = ny;
      z = nz;

      // Rotación XZ lenta (variedad visual)
      nx = x * cosC - z * sinC;
      nz = x * sinC + z * cosC;
      x = nx;
      z = nz;

      // Proyección 4D → 3D (perspectiva en w)
      const pw = d4 / (d4 - w);
      const x3 = x * pw;
      const y3 = y * pw;
      const z3 = z * pw;

      // Proyección 3D → 2D (perspectiva en z)
      const pz = d3 / (d3 - z3);

      return {
        sx: x3 * pz * scale + cx,
        sy: y3 * pz * scale + cy,
        depth: pw * pz,
      };
    });
  }

  private render = () => {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Trail fade
    ctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`;
    ctx.fillRect(0, 0, w, h);

    // Actualizar ángulos
    this.angleA += this.params.speedA;
    this.angleB += this.params.speedB;

    const projected = this.projectAll();

    // Dibujar aristas (de atrás hacia adelante para oclusión natural)
    ctx.lineWidth = EDGE_WIDTH;
    for (const [i, j] of EDGES) {
      const a = projected[i];
      const b = projected[j];
      const avgDepth = (a.depth + b.depth) / 2;
      const alpha = Math.min(Math.max(avgDepth * 0.35, 0.05), 0.75);
      ctx.strokeStyle = `rgba(200,215,255,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(b.sx, b.sy);
      ctx.stroke();
    }

    // Dibujar vértices
    for (const p of projected) {
      const alpha = Math.min(Math.max(p.depth * 0.45, 0.1), 1);
      const r = Math.max(VERTEX_RADIUS * p.depth * 0.5, 1.5);
      const glowR = VERTEX_GLOW * Math.max(p.depth * 0.4, 0.3);

      // Glow
      const grad = ctx.createRadialGradient(
        p.sx, p.sy, 0,
        p.sx, p.sy, glowR
      );
      grad.addColorStop(0, `rgba(180,200,255,${alpha * 0.25})`);
      grad.addColorStop(1, "rgba(180,200,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, glowR, 0, TAU);
      ctx.fill();

      // Punto del vértice
      ctx.fillStyle = `rgba(220,230,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, TAU);
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

  action(id: string): Record<string, number> | void {
    if (id === "reset") {
      this.angleA = 0;
      this.angleB = 0;
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  destroy() {
    this.stop();
  }
}
