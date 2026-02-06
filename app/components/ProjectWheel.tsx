"use client";

import React, { ReactNode, useMemo } from "react";
import { useWheelRotation } from "@/app/hooks/useWheelRotation";
import {
  PROJECTS,
  WHEEL_CONFIG,
} from "@/app/config/wheel.config";

interface WheelItemPosition {
  x: number;
  y: number;
  angle: number;
  isVisible: boolean;
}

// Ángulo total que ocupa un ciclo completo de la rueda
const TOTAL_CYCLE_ANGLE = WHEEL_CONFIG.totalSlots * WHEEL_CONFIG.anglePerSlot;

function calculateItemPosition(
  slotIndex: number,
  rotation: number
): WheelItemPosition {
  const baseAngle = slotIndex * WHEEL_CONFIG.anglePerSlot;

  // Normalizar la rotación al ciclo de la rueda
  const normalizedRotation = ((rotation % TOTAL_CYCLE_ANGLE) + TOTAL_CYCLE_ANGLE) % TOTAL_CYCLE_ANGLE;

  let displayAngle = baseAngle - normalizedRotation;

  // Ajustar para que sea circular (wrap around)
  if (displayAngle < -TOTAL_CYCLE_ANGLE / 2) {
    displayAngle += TOTAL_CYCLE_ANGLE;
  } else if (displayAngle > TOTAL_CYCLE_ANGLE / 2) {
    displayAngle -= TOTAL_CYCLE_ANGLE;
  }

  const isVisible =
    displayAngle >= -(WHEEL_CONFIG.maxVisibleAngle + WHEEL_CONFIG.visibilityMargin) &&
    displayAngle <= WHEEL_CONFIG.maxVisibleAngle + WHEEL_CONFIG.visibilityMargin;

  if (!isVisible) {
    return { x: 0, y: 0, angle: displayAngle, isVisible: false };
  }

  const radians = (displayAngle * Math.PI) / 180;
  const cosMax = Math.cos(((WHEEL_CONFIG.maxVisibleAngle + 10) * Math.PI) / 180);
  const x = -(Math.cos(radians) * WHEEL_CONFIG.radius - cosMax * WHEEL_CONFIG.radius);
  const y = Math.sin(radians) * WHEEL_CONFIG.radius;

  return { x, y, angle: displayAngle, isVisible: true };
}

interface ProjectWheelProps {
  onProjectChange?: (index: number) => void;
}

export default function ProjectWheel({ onProjectChange }: ProjectWheelProps) {
  const { rotation, selectedIndex } = useWheelRotation();

  const prevIndexRef = React.useRef(selectedIndex);
  React.useEffect(() => {
    if (prevIndexRef.current !== selectedIndex) {
      prevIndexRef.current = selectedIndex;
      onProjectChange?.(selectedIndex);
    }
  }, [selectedIndex, onProjectChange]);

  const items = useMemo(() => {
    const renderedItems: ReactNode[] = [];

    for (let i = 0; i < WHEEL_CONFIG.totalSlots; i++) {
      const position = calculateItemPosition(i, rotation);

      if (!position.isVisible) continue;

      const isProject = i % WHEEL_CONFIG.slotsPerProject === 0;

      if (isProject) {
        const projectIndex =
          (i / WHEEL_CONFIG.slotsPerProject) % PROJECTS.length;
        const isSelected = projectIndex === selectedIndex;

        renderedItems.push(
          <div
            key={`project-${i}`}
            className="wheel-base"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) translateY(-50%) rotate(${-position.angle}deg)`,
            }}
          >
            <span
              className={`wheel-item__name ${isSelected ? 'wheel-item__name--selected' : ''}`}
            >
              {PROJECTS[projectIndex]}
            </span>
          </div>
        );
      } else {
        renderedItems.push(
          <div
            key={`tick-${i}`}
            className="wheel-base"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) translateY(-50%) rotate(${-position.angle}deg)`,
            }}
          >
            <span className="wheel-tick" />
          </div>
        );
      }
    }

    return renderedItems;
  }, [rotation, selectedIndex]);

  return (
    <div className="wheel-container">
      {/* Indicador de selección */}
      <div className="wheel-selector" />
      {items}
    </div>
  );
}
