"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ATTRACTORS, getDefaultParams } from "./attractors";
import { ChaosRenderer } from "./ChaosRenderer";
import BifurcationDiagram from "./BifurcationDiagram";

export default function ChaosAttractor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ChaosRenderer | null>(null);
  const [attractorIndex, setAttractorIndex] = useState(0);
  const [params, setParams] = useState(() => getDefaultParams(ATTRACTORS[0]));
  const [showBifurcation, setShowBifurcation] = useState(false);

  const attractor = ATTRACTORS[attractorIndex];

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const init = () => {
      if (el.clientWidth === 0 || el.clientHeight === 0) {
        requestAnimationFrame(init);
        return;
      }

      const renderer = new ChaosRenderer(
        el,
        ATTRACTORS[0],
        getDefaultParams(ATTRACTORS[0])
      );
      rendererRef.current = renderer;
      renderer.start();
    };

    init();

    const handleResize = () => rendererRef.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      rendererRef.current?.destroy();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleParamChange = useCallback((key: string, value: number) => {
    setParams((prev) => {
      const next = { ...prev, [key]: value };
      rendererRef.current?.updateParams(next);
      return next;
    });
  }, []);

  const handleAttractorChange = useCallback((index: number) => {
    const next = ATTRACTORS[index];
    const nextParams = getDefaultParams(next);
    setAttractorIndex(index);
    setParams(nextParams);
    rendererRef.current?.setAttractor(next, nextParams);
  }, []);

  const handlePerturb = useCallback(() => {
    const synced = rendererRef.current?.perturb();
    if (synced) setParams(synced);
  }, []);

  const handleReset = useCallback(() => {
    const defaults = getDefaultParams(ATTRACTORS[attractorIndex]);
    setParams(defaults);
    rendererRef.current?.setAttractor(ATTRACTORS[attractorIndex], defaults);
  }, [attractorIndex]);

  const handleLaunchTracers = useCallback(() => {
    rendererRef.current?.launchTracers();
  }, []);

  const handleToggleBifurcation = useCallback(() => {
    setShowBifurcation((prev) => {
      if (!prev) rendererRef.current?.stop();
      else rendererRef.current?.start();
      return !prev;
    });
  }, []);

  return (
    <>
      <div className="project-canvas">
        <canvas
          ref={canvasRef}
          className="chaos-canvas"
          style={{ display: showBifurcation ? "none" : "block" }}
        />
        {showBifurcation && (
          <BifurcationDiagram
            attractor={attractor}
            currentParamValue={params[attractor.bifurcation.paramKey]}
            onParamChange={handleParamChange}
          />
        )}
      </div>
      <div className="project-divider" />
      <div className="project-info">
        <h1 className="project-info__title">OpenDom</h1>
        <p className="project-info__subtitle">Chaos Theory</p>

        <div className="chaos-controls">
          <div className="chaos-selector">
            {ATTRACTORS.map((a, i) => (
              <button
                key={a.id}
                className={`chaos-selector__btn ${i === attractorIndex ? "chaos-selector__btn--active" : ""}`}
                onClick={() => handleAttractorChange(i)}
              >
                {a.name}
              </button>
            ))}
          </div>

          <div className="chaos-equations">
            {attractor.equations.map((eq, i) => (
              <span key={i} className="chaos-equations__line">
                {eq}
              </span>
            ))}
          </div>

          <div className="chaos-params">
            {attractor.params.map((p) => (
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
                  {params[p.key].toFixed(3)}
                </span>
              </label>
            ))}
          </div>

          <div className="chaos-actions">
            <button className="chaos-btn chaos-btn--accent" onClick={handleLaunchTracers}>
              Divergence
            </button>
            <button
              className={`chaos-btn ${showBifurcation ? "chaos-btn--active" : ""}`}
              onClick={handleToggleBifurcation}
            >
              Bifurcation
            </button>
            <button className="chaos-btn" onClick={handlePerturb}>
              Perturb
            </button>
            <button className="chaos-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
