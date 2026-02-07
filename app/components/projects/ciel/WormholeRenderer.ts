// Motor Canvas 2D para gravitational lensing (agujero de gusano)
// Ecuación de lente delgada, anillo de Einstein, photon ring
// Lente interactiva que sigue el cursor con interpolación suave

import { SimulationRenderer } from "./simulations";

const STAR_COUNT = 2000;
const STAR_PADDING = 250;
const LERP_FACTOR = 0.08;
const IDLE_SPEED = 0.0004;
const SHADOW_FACTOR = 0.25;
const TAU = Math.PI * 2;

export class WormholeRenderer implements SimulationRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private animationId: number | null = null;

  // Estrellas (posiciones reales)
  private starX: Float64Array;
  private starY: Float64Array;
  private starSize: Float32Array;
  private starBright: Float32Array;

  // Posición de la lente
  private lensX = 0;
  private lensY = 0;
  private targetX = 0;
  private targetY = 0;
  private mouseOnCanvas = false;
  private idleTime = 0;

  params: Record<string, number>;

  // Bound event handlers para poder removerlos
  private boundMove: (e: PointerEvent) => void;
  private boundEnter: () => void;
  private boundLeave: () => void;

  constructor(canvas: HTMLCanvasElement, params: Record<string, number>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.params = { ...params };

    this.starX = new Float64Array(STAR_COUNT);
    this.starY = new Float64Array(STAR_COUNT);
    this.starSize = new Float32Array(STAR_COUNT);
    this.starBright = new Float32Array(STAR_COUNT);

    this.boundMove = this.handlePointerMove.bind(this);
    this.boundEnter = () => { this.mouseOnCanvas = true; };
    this.boundLeave = () => { this.mouseOnCanvas = false; };

    this.resize();
    this.generateStars();
    this.setupEvents();

    // Lente empieza en el centro
    this.lensX = this.targetX = this.width / 2;
    this.lensY = this.targetY = this.height / 2;
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private generateStars() {
    const w = this.width;
    const h = this.height;

    for (let i = 0; i < STAR_COUNT; i++) {
      this.starX[i] = -STAR_PADDING + Math.random() * (w + 2 * STAR_PADDING);
      this.starY[i] = -STAR_PADDING + Math.random() * (h + 2 * STAR_PADDING);
      // Distribución exponencial: mayoría tenues, pocas brillantes
      const raw = Math.random();
      this.starSize[i] = 0.4 + raw * raw * 2.2;
      this.starBright[i] = 0.2 + raw * 0.8;
    }
  }

  private setupEvents() {
    this.canvas.addEventListener("pointermove", this.boundMove);
    this.canvas.addEventListener("pointerenter", this.boundEnter);
    this.canvas.addEventListener("pointerleave", this.boundLeave);
  }

  private handlePointerMove(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.targetX = e.clientX - rect.left;
    this.targetY = e.clientY - rect.top;
    this.mouseOnCanvas = true;
  }

  private updateLensPosition() {
    if (!this.mouseOnCanvas) {
      // Órbita Lissajous cuando no hay interacción
      this.idleTime += 1;
      this.targetX =
        this.width / 2 +
        Math.sin(this.idleTime * IDLE_SPEED) * this.width * 0.2;
      this.targetY =
        this.height / 2 +
        Math.sin(this.idleTime * IDLE_SPEED * 1.3 + 1.0) * this.height * 0.15;
    }

    // Interpolación suave
    this.lensX += (this.targetX - this.lensX) * LERP_FACTOR;
    this.lensY += (this.targetY - this.lensY) * LERP_FACTOR;
  }

  private render = () => {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    this.updateLensPosition();

    const lx = this.lensX;
    const ly = this.lensY;
    const eR = this.params.einsteinRadius;
    const eR2 = eR * eR;
    const intensity = this.params.intensity;
    const skipSecondaryBeyond = eR * 3;

    // Dibujar estrellas con lensing
    for (let i = 0; i < STAR_COUNT; i++) {
      const dx = this.starX[i] - lx;
      const dy = this.starY[i] - ly;
      const beta = Math.sqrt(dx * dx + dy * dy);

      if (beta < 0.5) continue; // Detrás del centro exacto

      const ux = dx / beta;
      const uy = dy / beta;

      const disc = Math.sqrt(beta * beta + 4 * eR2);

      // Imagen primaria (mismo lado que la fuente)
      const theta1 = (beta + disc) * 0.5;
      const mu1 = theta1 / beta;
      const img1x = lx + ux * theta1;
      const img1y = ly + uy * theta1;

      if (img1x > -10 && img1x < w + 10 && img1y > -10 && img1y < h + 10) {
        const size1 = Math.min(this.starSize[i] * (1 + (mu1 - 1) * intensity * 0.4), 5);
        const bright1 = Math.min(this.starBright[i] * mu1 * intensity * 0.7, 1);
        ctx.fillStyle = `rgba(255,255,255,${bright1})`;
        ctx.beginPath();
        ctx.arc(img1x, img1y, size1, 0, TAU);
        ctx.fill();
      }

      // Imagen secundaria (lado opuesto, más tenue)
      if (beta < skipSecondaryBeyond) {
        const theta2 = (beta - disc) * 0.5; // negativo
        const absTheta2 = -theta2;
        const mu2 = absTheta2 / beta;
        const img2x = lx - ux * absTheta2;
        const img2y = ly - uy * absTheta2;

        if (
          img2x > -10 && img2x < w + 10 &&
          img2y > -10 && img2y < h + 10 &&
          mu2 > 0.05
        ) {
          const size2 = Math.min(this.starSize[i] * (1 + (mu2 - 1) * intensity * 0.3), 3);
          const bright2 = Math.min(this.starBright[i] * mu2 * intensity * 0.4, 0.7);
          if (bright2 > 0.03) {
            ctx.fillStyle = `rgba(255,255,255,${bright2})`;
            ctx.beginPath();
            ctx.arc(img2x, img2y, Math.max(size2, 0.3), 0, TAU);
            ctx.fill();
          }
        }
      }
    }

    // Photon ring glow (anillo sutil en el radio de Einstein)
    const ringGrad = ctx.createRadialGradient(
      lx, ly, eR * 0.85,
      lx, ly, eR * 1.25
    );
    ringGrad.addColorStop(0, "rgba(200,220,255,0)");
    ringGrad.addColorStop(0.4, "rgba(200,220,255,0.06)");
    ringGrad.addColorStop(0.6, "rgba(200,220,255,0.06)");
    ringGrad.addColorStop(1, "rgba(200,220,255,0)");
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, eR * 1.25, 0, TAU);
    ctx.fill();

    // Sombra central (black hole shadow)
    const shadowR = eR * SHADOW_FACTOR;
    const shadowGrad = ctx.createRadialGradient(
      lx, ly, 0,
      lx, ly, shadowR
    );
    shadowGrad.addColorStop(0, "rgba(0,0,0,1)");
    shadowGrad.addColorStop(0.7, "rgba(0,0,0,0.9)");
    shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, shadowR, 0, TAU);
    ctx.fill();

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
      this.generateStars();
    }
  }

  destroy() {
    this.stop();
    this.canvas.removeEventListener("pointermove", this.boundMove);
    this.canvas.removeEventListener("pointerenter", this.boundEnter);
    this.canvas.removeEventListener("pointerleave", this.boundLeave);
  }
}
