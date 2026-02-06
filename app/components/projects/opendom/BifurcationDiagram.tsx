"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { Attractor } from "./attractors";
import { computeBifurcation } from "./bifurcation";

const ML = 44, MR = 20;

interface Props {
  attractor: Attractor;
  currentParamValue: number;
  onParamChange: (key: string, value: number) => void;
}

export default function BifurcationDiagram({
  attractor,
  currentParamValue,
  onParamChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const points = useMemo(() => computeBifurcation(attractor), [attractor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fondo
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    if (points.length === 0) return;

    const { range, paramKey, component } = attractor.bifurcation;
    const [pMin, pMax] = range;

    // Bounds de los valores
    let vMin = Infinity,
      vMax = -Infinity;
    for (const pt of points) {
      if (pt.value < vMin) vMin = pt.value;
      if (pt.value > vMax) vMax = pt.value;
    }
    const vRange = vMax - vMin || 1;
    vMin -= vRange * 0.05;
    vMax += vRange * 0.05;

    const MT = 20,
      MB = 32;
    const plotW = w - ML - MR;
    const plotH = h - MT - MB;

    // Puntos del diagrama (opacidad baja, acumulativa)
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    for (const pt of points) {
      const px = ML + ((pt.param - pMin) / (pMax - pMin)) * plotW;
      const py = MT + plotH - ((pt.value - vMin) / (vMax - vMin)) * plotH;
      ctx.fillRect(px - 0.5, py - 0.5, 1.5, 1.5);
    }

    // Línea indicadora del valor actual del parámetro
    if (currentParamValue >= pMin && currentParamValue <= pMax) {
      const cx = ML + ((currentParamValue - pMin) / (pMax - pMin)) * plotW;
      ctx.strokeStyle = "rgba(100, 200, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, MT);
      ctx.lineTo(cx, MT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Etiquetas
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "11px 'SF Mono', 'Fira Code', monospace";

    // Eje X: símbolo del parámetro
    const paramDef = attractor.params.find((p) => p.key === paramKey);
    const symbol = paramDef?.symbol ?? paramKey;
    ctx.textAlign = "center";
    ctx.fillText(symbol, ML + plotW / 2, h - 6);
    ctx.textAlign = "left";
    ctx.fillText(pMin.toFixed(pMin < 1 ? 2 : 0), ML, h - 6);
    ctx.textAlign = "right";
    ctx.fillText(pMax.toFixed(pMax < 1 ? 2 : 0), ML + plotW, h - 6);

    // Eje Y: componente
    const compLabel = ["x", "y", "z"][component] + " max";
    ctx.save();
    ctx.translate(12, MT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(compLabel, 0, 0);
    ctx.restore();
  }, [points, attractor, currentParamValue]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = rect.width;
      const plotW = w - ML - MR;

      const { range, paramKey } = attractor.bifurcation;
      const [pMin, pMax] = range;
      const paramVal = pMin + ((x - ML) / plotW) * (pMax - pMin);
      onParamChange(paramKey, Math.max(pMin, Math.min(pMax, paramVal)));
    },
    [attractor, onParamChange]
  );

  return (
    <canvas
      ref={canvasRef}
      className="chaos-canvas chaos-canvas--interactive"
      onClick={handleClick}
    />
  );
}
