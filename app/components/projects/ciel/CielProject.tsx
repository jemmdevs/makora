"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  SIMULATIONS,
  getDefaultParams,
  SimulationRenderer,
} from "./simulations";
import { GravityRenderer } from "./GravityRenderer";
import { WormholeRenderer } from "./WormholeRenderer";
import { DimensionRenderer } from "./DimensionRenderer";

// Factory: mapea simulation ID → clase renderer
const RENDERERS: Record<
  string,
  new (
    canvas: HTMLCanvasElement,
    params: Record<string, number>
  ) => SimulationRenderer
> = {
  gravity: GravityRenderer,
  wormhole: WormholeRenderer,
  dimensions: DimensionRenderer,
};

export default function CielProject() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SimulationRenderer | null>(null);
  const [simIndex, setSimIndex] = useState(0);
  const [params, setParams] = useState(() => getDefaultParams(SIMULATIONS[0]));

  const sim = SIMULATIONS[simIndex];

  // Crear renderer para una simulación
  const createRenderer = useCallback(
    (index: number, p: Record<string, number>) => {
      const el = canvasRef.current;
      if (!el) return;

      rendererRef.current?.destroy();

      const simDef = SIMULATIONS[index];
      const Ctor = RENDERERS[simDef.id];
      if (!Ctor) return;

      const renderer = new Ctor(el, p);
      rendererRef.current = renderer;
      renderer.start();
    },
    []
  );

  // Init al montar (mismo patrón deferred que ChaosAttractor)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const init = () => {
      if (el.clientWidth === 0 || el.clientHeight === 0) {
        requestAnimationFrame(init);
        return;
      }
      createRenderer(0, getDefaultParams(SIMULATIONS[0]));
    };

    init();

    const handleResize = () => rendererRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      rendererRef.current?.destroy();
      window.removeEventListener("resize", handleResize);
    };
  }, [createRenderer]);

  const handleSimChange = useCallback(
    (index: number) => {
      const nextParams = getDefaultParams(SIMULATIONS[index]);
      setSimIndex(index);
      setParams(nextParams);
      createRenderer(index, nextParams);
    },
    [createRenderer]
  );

  const handleParamChange = useCallback((key: string, value: number) => {
    setParams((prev) => {
      const next = { ...prev, [key]: value };
      rendererRef.current?.updateParams(next);
      return next;
    });
  }, []);

  const handleAction = useCallback(
    (actionId: string) => {
      if (actionId === "reset") {
        const defaults = getDefaultParams(SIMULATIONS[simIndex]);
        rendererRef.current?.updateParams(defaults);
        rendererRef.current?.action("reset");
        setParams(defaults);
      } else {
        const result = rendererRef.current?.action(actionId);
        if (result) setParams(result as Record<string, number>);
      }
    },
    [simIndex]
  );

  return (
    <>
      <div className="project-canvas">
        <canvas ref={canvasRef} className="chaos-canvas" />
      </div>
      <div className="project-divider" />
      <div className="project-info">
        <h1 className="project-info__title">Ciel</h1>
        <p className="project-info__subtitle">{sim.subtitle}</p>

        <div className="chaos-controls">
          {/* Selector de simulación */}
          <div className="chaos-selector">
            {SIMULATIONS.map((s, i) => (
              <button
                key={s.id}
                className={`chaos-selector__btn ${i === simIndex ? "chaos-selector__btn--active" : ""}`}
                onClick={() => handleSimChange(i)}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Ecuaciones */}
          <div className="chaos-equations">
            {sim.equations.map((eq, i) => (
              <span key={i} className="chaos-equations__line">
                {eq}
              </span>
            ))}
          </div>

          {/* Sliders de parámetros */}
          <div className="chaos-params">
            {sim.params.map((p) => (
              <label key={p.key} className="chaos-param">
                <span className="chaos-param__symbol">{p.symbol}</span>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={params[p.key]}
                  onChange={(e) =>
                    handleParamChange(p.key, parseFloat(e.target.value))
                  }
                  className="chaos-param__slider"
                />
                <span className="chaos-param__value">
                  {params[p.key].toFixed(
                    p.step < 0.01 ? 3 : p.step < 1 ? 2 : 0
                  )}
                </span>
              </label>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="chaos-actions">
            {sim.actions.map((a) => (
              <button
                key={a.id}
                className={`chaos-btn ${a.accent ? "chaos-btn--accent" : ""}`}
                onClick={() => handleAction(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
