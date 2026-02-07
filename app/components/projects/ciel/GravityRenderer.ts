// Motor Canvas 2D para simulación gravitacional N-body
// Velocity Verlet (simpléctica) para cuerpos masivos, Euler para polvo
// Trail fade con overlay, glow radial en cuerpos
// Cámara auto-zoom centrada en centro de masa

import { SimulationRenderer } from "./simulations";

const DUST_COUNT = 600;
const TRAIL_FADE = 0.04;
const DT = 0.4;
const MAX_BODIES = 12;
const BODY_RADIUS = 4;
const BODY_GLOW_RADIUS = 18;
const INITIAL_MASS = 200;
const TAU = Math.PI * 2;

// Cámara
const CAM_FOLLOW_SPEED = 0.05;
const CAM_ZOOM_SPEED = 0.03;
const CAM_PADDING = 2.8;
const CAM_MIN_EXTENT = 80;

const BODY_COLORS: [number, number, number][] = [
  [100, 200, 255], // cyan
  [255, 120, 100], // coral
  [255, 215, 70],  // gold
  [180, 100, 255], // purple
  [100, 255, 150], // green
  [255, 150, 200], // pink
  [255, 170, 60],  // orange
  [100, 255, 255], // teal
  [200, 160, 255], // lavender
  [255, 255, 100], // yellow
  [150, 255, 200], // mint
  [255, 150, 150], // salmon
];

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  mass: number;
  color: [number, number, number];
}

export class GravityRenderer implements SimulationRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private animationId: number | null = null;

  private bodies: Body[] = [];

  // Cámara (sigue centro de masa, auto-zoom)
  private camX = 0;
  private camY = 0;
  private scale = 1;

  // Polvo (Float64Array para rendimiento)
  private dustX: Float64Array;
  private dustY: Float64Array;
  private dustVx: Float64Array;
  private dustVy: Float64Array;

  params: Record<string, number>;

  constructor(canvas: HTMLCanvasElement, params: Record<string, number>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.params = { ...params };

    this.dustX = new Float64Array(DUST_COUNT);
    this.dustY = new Float64Array(DUST_COUNT);
    this.dustVx = new Float64Array(DUST_COUNT);
    this.dustVy = new Float64Array(DUST_COUNT);

    this.resize();
    this.initBodies();
    this.initDust();
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

  // Convierte coordenadas mundo → pantalla
  private toScreen(wx: number, wy: number): [number, number] {
    return [
      (wx - this.camX) * this.scale + this.width / 2,
      (wy - this.camY) * this.scale + this.height / 2,
    ];
  }

  private createBody(
    x: number, y: number,
    vx: number, vy: number,
    mass: number, colorIndex: number
  ): Body {
    return {
      x, y, vx, vy, ax: 0, ay: 0,
      mass,
      color: BODY_COLORS[colorIndex % BODY_COLORS.length],
    };
  }

  private initBodies() {
    this.bodies = [];
    const cx = this.width / 2;
    const cy = this.height / 2;
    const orbitR = Math.min(this.width, this.height) * 0.18;

    const G = this.params.G;
    const mass = INITIAL_MASS;
    const speed = Math.sqrt(G * mass / (orbitR * 0.8));

    for (let i = 0; i < 3; i++) {
      const angle = (i * TAU) / 3 - Math.PI / 2;
      const x = cx + Math.cos(angle) * orbitR;
      const y = cy + Math.sin(angle) * orbitR;
      const vx = -Math.sin(angle) * speed;
      const vy = Math.cos(angle) * speed;
      this.bodies.push(this.createBody(x, y, vx, vy, mass, i));
    }

    // Cámara empieza en el centro de masa
    this.camX = cx;
    this.camY = cy;
    this.scale = 1;

    this.computeAllAccelerations();
  }

  private initDust() {
    // Centrar polvo alrededor del centro de masa actual
    const cx = this.camX || this.width / 2;
    const cy = this.camY || this.height / 2;
    const spread = Math.min(this.width, this.height) * 0.4;

    for (let i = 0; i < DUST_COUNT; i++) {
      const angle = Math.random() * TAU;
      const dist = Math.random() * spread;
      this.dustX[i] = cx + Math.cos(angle) * dist;
      this.dustY[i] = cy + Math.sin(angle) * dist;
      this.dustVx[i] = (Math.random() - 0.5) * 0.3;
      this.dustVy[i] = (Math.random() - 0.5) * 0.3;
    }
  }

  private computeAccel(
    x: number, y: number, skipIndex: number
  ): [number, number] {
    let ax = 0;
    let ay = 0;
    const G = this.params.G;
    const eps2 = this.params.softening * this.params.softening;

    for (let j = 0; j < this.bodies.length; j++) {
      if (j === skipIndex) continue;
      const b = this.bodies[j];
      const dx = b.x - x;
      const dy = b.y - y;
      const r2 = dx * dx + dy * dy + eps2;
      const invR3 = G * b.mass / (r2 * Math.sqrt(r2));
      ax += dx * invR3;
      ay += dy * invR3;
    }

    return [ax, ay];
  }

  private computeAllAccelerations() {
    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      const [ax, ay] = this.computeAccel(b.x, b.y, i);
      b.ax = ax;
      b.ay = ay;
    }
  }

  // Actualizar cámara: seguir COM + auto-zoom
  private updateCamera() {
    const bodies = this.bodies;
    const n = bodies.length;
    if (n === 0) return;

    // Centro de masa
    let totalMass = 0;
    let comX = 0;
    let comY = 0;
    for (let i = 0; i < n; i++) {
      comX += bodies[i].x * bodies[i].mass;
      comY += bodies[i].y * bodies[i].mass;
      totalMass += bodies[i].mass;
    }
    comX /= totalMass;
    comY /= totalMass;

    // Seguimiento suave del COM
    this.camX += (comX - this.camX) * CAM_FOLLOW_SPEED;
    this.camY += (comY - this.camY) * CAM_ZOOM_SPEED;

    // Distancia máxima de cualquier cuerpo al COM
    let maxDist = CAM_MIN_EXTENT;
    for (let i = 0; i < n; i++) {
      const dx = bodies[i].x - comX;
      const dy = bodies[i].y - comY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) maxDist = dist;
    }

    // Escala para que todo quepa con padding
    const canvasSize = Math.min(this.width, this.height);
    let targetScale = canvasSize / (maxDist * CAM_PADDING);
    targetScale = Math.min(targetScale, 1); // Nunca zoom-in más allá de 1x

    // Zoom suave
    this.scale += (targetScale - this.scale) * CAM_ZOOM_SPEED;
  }

  private stepBodies() {
    const dt = DT;
    const bodies = this.bodies;
    const n = bodies.length;

    for (let i = 0; i < n; i++) {
      const b = bodies[i];
      b.x += b.vx * dt + 0.5 * b.ax * dt * dt;
      b.y += b.vy * dt + 0.5 * b.ay * dt * dt;
    }

    const oldAx = new Float64Array(n);
    const oldAy = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      oldAx[i] = bodies[i].ax;
      oldAy[i] = bodies[i].ay;
    }

    this.computeAllAccelerations();

    for (let i = 0; i < n; i++) {
      const b = bodies[i];
      b.vx += 0.5 * (oldAx[i] + b.ax) * dt;
      b.vy += 0.5 * (oldAy[i] + b.ay) * dt;
    }
  }

  private stepDust() {
    const dt = DT;
    const G = this.params.G;
    const eps2 = this.params.softening * this.params.softening;
    const bodies = this.bodies;
    const n = bodies.length;

    // Respawn relativo al COM
    const comX = this.camX;
    const comY = this.camY;
    // Distancia máxima en mundo: lo que se ve en pantalla / scale + margen
    const viewExtent = Math.max(this.width, this.height) / this.scale;
    const maxDist2 = viewExtent * viewExtent * 4;

    for (let d = 0; d < DUST_COUNT; d++) {
      let ax = 0;
      let ay = 0;

      for (let j = 0; j < n; j++) {
        const dx = bodies[j].x - this.dustX[d];
        const dy = bodies[j].y - this.dustY[d];
        const r2 = dx * dx + dy * dy + eps2;
        const invR3 = G * bodies[j].mass / (r2 * Math.sqrt(r2));
        ax += dx * invR3;
        ay += dy * invR3;
      }

      this.dustVx[d] += ax * dt;
      this.dustVy[d] += ay * dt;
      this.dustX[d] += this.dustVx[d] * dt;
      this.dustY[d] += this.dustVy[d] * dt;

      // Respawn si se aleja demasiado del COM
      const distX = this.dustX[d] - comX;
      const distY = this.dustY[d] - comY;
      if (distX * distX + distY * distY > maxDist2) {
        const angle = Math.random() * TAU;
        const dist = Math.random() * viewExtent * 0.4;
        this.dustX[d] = comX + Math.cos(angle) * dist;
        this.dustY[d] = comY + Math.sin(angle) * dist;
        this.dustVx[d] = (Math.random() - 0.5) * 0.3;
        this.dustVy[d] = (Math.random() - 0.5) * 0.3;
      }
    }
  }

  private render = () => {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Trail fade
    ctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`;
    ctx.fillRect(0, 0, w, h);

    // Física
    this.stepBodies();
    this.stepDust();

    // Cámara
    this.updateCamera();

    const sc = this.scale;

    // Dibujar polvo
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let d = 0; d < DUST_COUNT; d++) {
      const [sx, sy] = this.toScreen(this.dustX[d], this.dustY[d]);
      if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Dibujar cuerpos con glow
    for (const b of this.bodies) {
      const [sx, sy] = this.toScreen(b.x, b.y);
      const [r, g, bl] = b.color;

      // Solo dibujar si está en pantalla (con margen)
      if (sx < -100 || sx > w + 100 || sy < -100 || sy > h + 100) continue;

      const scaledGlow = BODY_GLOW_RADIUS * sc;
      const scaledRadius = Math.max(BODY_RADIUS * sc, 2);

      // Glow radial
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, scaledGlow);
      grad.addColorStop(0, `rgba(${r},${g},${bl},0.35)`);
      grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, scaledGlow, 0, TAU);
      ctx.fill();

      // Cuerpo sólido
      ctx.fillStyle = `rgb(${r},${g},${bl})`;
      ctx.beginPath();
      ctx.arc(sx, sy, scaledRadius, 0, TAU);
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
    switch (id) {
      case "addBody": {
        if (this.bodies.length >= MAX_BODIES) return;
        // Nuevo cuerpo relativo al COM actual
        const angle = Math.random() * TAU;
        const dist = Math.min(this.width, this.height) * (0.1 + Math.random() * 0.15);
        const x = this.camX + Math.cos(angle) * dist;
        const y = this.camY + Math.sin(angle) * dist;
        const speed = Math.sqrt(
          this.params.G * INITIAL_MASS / (dist * 0.8)
        );
        const vx = -Math.sin(angle) * speed;
        const vy = Math.cos(angle) * speed;
        const mass = INITIAL_MASS * (0.5 + Math.random());
        this.bodies.push(
          this.createBody(x, y, vx, vy, mass, this.bodies.length)
        );
        this.computeAllAccelerations();
        break;
      }
      case "perturb": {
        for (const b of this.bodies) {
          b.vx += (Math.random() - 0.5) * 3;
          b.vy += (Math.random() - 0.5) * 3;
        }
        break;
      }
      case "reset": {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.initBodies();
        this.initDust();
        break;
      }
    }
  }

  destroy() {
    this.stop();
  }
}
