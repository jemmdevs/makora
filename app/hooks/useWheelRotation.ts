"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { INTERACTION_CONFIG, WHEEL_CONFIG } from "@/app/config/wheel.config";

interface UseWheelRotationReturn {
  rotation: number;
  selectedIndex: number;
  isDragging: boolean;
}

// Ángulo que ocupa cada proyecto
const ANGLE_PER_PROJECT = WHEEL_CONFIG.anglePerProject;
const TOTAL_CYCLE = WHEEL_CONFIG.totalSlots * WHEEL_CONFIG.anglePerSlot;

function normalizeRotation(rotation: number): number {
  return ((rotation % TOTAL_CYCLE) + TOTAL_CYCLE) % TOTAL_CYCLE;
}

function getSelectedIndex(rotation: number): number {
  const normalized = normalizeRotation(rotation);
  const index = Math.round(normalized / ANGLE_PER_PROJECT) % WHEEL_CONFIG.totalProjects;
  return index;
}

function getSnapTarget(rotation: number): number {
  const normalized = normalizeRotation(rotation);
  const nearestIndex = Math.round(normalized / ANGLE_PER_PROJECT);
  return nearestIndex * ANGLE_PER_PROJECT;
}

export function useWheelRotation(): UseWheelRotationReturn {
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const rotationRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastY = useRef(0);
  const velocity = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const isSnapping = useRef(false);

  // Mantener rotationRef sincronizado
  useEffect(() => {
    rotationRef.current = rotation;
    setSelectedIndex(getSelectedIndex(rotation));
  }, [rotation]);

  const cancelAnimation = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  }, []);

  const animateToTarget = useCallback((target: number, duration: number = 300) => {
    cancelAnimation();
    isSnapping.current = true;

    const start = rotationRef.current;
    const startTime = performance.now();

    // Calcular diferencia más corta
    let diff = target - normalizeRotation(start);
    if (diff > TOTAL_CYCLE / 2) diff -= TOTAL_CYCLE;
    if (diff < -TOTAL_CYCLE / 2) diff += TOTAL_CYCLE;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const newRotation = start + diff * eased;
      setRotation(newRotation);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        isSnapping.current = false;
        animationFrame.current = null;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
  }, [cancelAnimation]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isSnapping.current || isDraggingRef.current) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentSnap = getSnapTarget(rotationRef.current);
      const newTarget = currentSnap + direction * ANGLE_PER_PROJECT;

      animateToTarget(newTarget, 200);
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastY.current = e.clientY;
      velocity.current = 0;
      cancelAnimation();
      isSnapping.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaY = e.clientY - lastY.current;
      velocity.current = deltaY;
      lastY.current = e.clientY;

      setRotation(prev => prev - deltaY * INTERACTION_CONFIG.dragSensitivity);
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const currentVelocity = velocity.current;

      if (Math.abs(currentVelocity) > 3) {
        // Inercia
        const applyInertia = () => {
          if (Math.abs(velocity.current) > 0.5) {
            setRotation(prev => {
              const newRot = prev - velocity.current * INTERACTION_CONFIG.dragSensitivity;
              rotationRef.current = newRot;
              return newRot;
            });
            velocity.current *= INTERACTION_CONFIG.inertiaFriction;
            animationFrame.current = requestAnimationFrame(applyInertia);
          } else {
            // Snap al terminar inercia
            const target = getSnapTarget(rotationRef.current);
            animateToTarget(target, 300);
          }
        };
        applyInertia();
      } else {
        // Snap directo
        const target = getSnapTarget(rotationRef.current);
        animateToTarget(target, 300);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerleave", handlePointerUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerUp);
      cancelAnimation();
    };
  }, [animateToTarget, cancelAnimation]);

  return {
    rotation,
    selectedIndex,
    isDragging: isDraggingRef.current,
  };
}
