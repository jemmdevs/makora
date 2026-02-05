"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { INTERACTION_CONFIG } from "@/app/config/wheel.config";

interface UseWheelRotationOptions {
  wheelSensitivity?: number;
  dragSensitivity?: number;
  inertiaFriction?: number;
  inertiaThreshold?: number;
}

interface UseWheelRotationReturn {
  rotation: number;
  isDragging: boolean;
  setRotation: (value: number | ((prev: number) => number)) => void;
}

export function useWheelRotation(
  options: UseWheelRotationOptions = {}
): UseWheelRotationReturn {
  const {
    wheelSensitivity = INTERACTION_CONFIG.wheelSensitivity,
    dragSensitivity = INTERACTION_CONFIG.dragSensitivity,
    inertiaFriction = INTERACTION_CONFIG.inertiaFriction,
    inertiaThreshold = INTERACTION_CONFIG.inertiaThreshold,
  } = options;

  const [rotation, setRotation] = useState(0);
  const isDraggingRef = useRef(false);
  const lastY = useRef(0);
  const velocity = useRef(0);
  const animationFrame = useRef<number | null>(null);

  const cancelInertia = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const delta = e.deltaY * wheelSensitivity;
      setRotation((prev) => prev + delta);
    },
    [wheelSensitivity]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastY.current = e.clientY;
      velocity.current = 0;
      cancelInertia();
    },
    [cancelInertia]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaY = e.clientY - lastY.current;
      velocity.current = deltaY;
      lastY.current = e.clientY;

      setRotation((prev) => prev - deltaY * dragSensitivity);
    },
    [dragSensitivity]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const applyInertia = () => {
      if (Math.abs(velocity.current) > inertiaThreshold) {
        setRotation((prev) => prev - velocity.current * dragSensitivity);
        velocity.current *= inertiaFriction;
        animationFrame.current = requestAnimationFrame(applyInertia);
      } else {
        animationFrame.current = null;
      }
    };

    applyInertia();
  }, [dragSensitivity, inertiaFriction, inertiaThreshold]);

  useEffect(() => {
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
      cancelInertia();
    };
  }, [
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    cancelInertia,
  ]);

  return {
    rotation,
    isDragging: isDraggingRef.current,
    setRotation,
  };
}
