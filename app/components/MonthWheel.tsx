"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";

const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
];

export default function MonthWheel() {
    const [rotation, setRotation] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastY = useRef(0);
    const velocity = useRef(0);
    const animationFrame = useRef<number | null>(null);

    const radius = 650; // Radio menor = Mayor curvatura
    const anglePerMonth = 360 / months.length; // 30 grados por mes
    const maxVisibleAngle = 50;

    // Número de meses visibles en el arco


    // Manejar el scroll con rueda del mouse
    const handleWheel = useCallback((e: WheelEvent) => {
        // No prevenimos default para permitir scroll normal si fuera necesario en el futuro,
        // pero aquí parece que queremos controlar la rueda.
        // e.preventDefault(); 
        const delta = e.deltaY * 0.05; // Scroll mucho más suave (factor reducido)
        setRotation(prev => prev + delta);
    }, []);

    // Manejar el inicio del drag
    const handlePointerDown = useCallback((e: PointerEvent) => {
        isDragging.current = true;
        lastY.current = e.clientY;
        velocity.current = 0;
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
    }, []);

    // Manejar el movimiento durante el drag
    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging.current) return;

        const deltaY = e.clientY - lastY.current;
        velocity.current = deltaY;
        lastY.current = e.clientY;

        setRotation(prev => prev - deltaY * 0.15); // Factor de drag suavizado
    }, []);

    // Manejar el fin del drag con inercia
    const handlePointerUp = useCallback(() => {
        isDragging.current = false;

        // Aplicar inercia
        const applyInertia = () => {
            if (Math.abs(velocity.current) > 0.01) { // Umbral más bajo para inercia más larga
                setRotation(prev => prev - velocity.current * 0.15);
                velocity.current *= 0.96; // Fricción reducida para inercia más larga y suave
                animationFrame.current = requestAnimationFrame(applyInertia);
            }
        };

        applyInertia();
    }, []);

    // Configurar event listeners globales en window
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
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, [handleWheel, handlePointerDown, handlePointerMove, handlePointerUp]);

    // Generar los elementos visibles (meses + ticks)
    const renderItems = () => {
        const items: ReactNode[] = [];

        // Definimos slots equidistantes para todo el círculo
        // AHORA: 4 espacios por mes (1 slot mes + 3 ticks)
        const totalSlots = 48; // 12 * 4 
        const anglePerSlot = 360 / totalSlots;

        // Renderizamos basado en slots
        for (let i = 0; i < totalSlots; i++) {
            const baseAngle = i * anglePerSlot;
            // El ángulo de visualización depende de la rotación actual
            const displayAngle = baseAngle - rotation;

            // Normalizar el ángulo a [-180, 180] para cálculos de visibilidad
            let normalizedAngle = ((displayAngle % 360) + 360) % 360;
            if (normalizedAngle > 180) normalizedAngle -= 360;

            // Solo renderizar si está dentro del arco visible
            if (normalizedAngle >= -(maxVisibleAngle + 5) && normalizedAngle <= (maxVisibleAngle + 5)) {
                const radians = (normalizedAngle * Math.PI) / 180;

                // offset para curvatura
                const cosMax = Math.cos((maxVisibleAngle + 10) * Math.PI / 180);
                const x = -(Math.cos(radians) * radius - cosMax * radius);
                const y = Math.sin(radians) * radius;

                // Determinar si es mes o tick
                // Cada 4 slots es un mes (0, 4, 8...)
                const isMonth = i % 4 === 0;

                if (isMonth) {
                    const monthIndex = (i / 4) % months.length;
                    items.push(
                        <div
                            key={`slot-${i}-month`}
                            className="month-item"
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                // Añadido translateY(-50%) para centrar perfectamente el elemento en su punto Y
                                transform: `translate(${x}px, ${y}px) translateY(-50%) rotate(${-normalizedAngle}deg)`,
                                opacity: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexDirection: 'row-reverse',
                                color: '#ffffff',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                transformOrigin: 'center center',
                                willChange: 'transform'
                            }}
                        >
                            <span style={{
                                color: '#ffffff',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                letterSpacing: '2px',
                            }}>{months[monthIndex]}</span>
                        </div>
                    );
                } else {
                    items.push(
                        <div
                            key={`slot-${i}-tick`}
                            className="tick"
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                width: '24px',
                                height: '2px',
                                background: '#ffffff',
                                // Añadido translateY(-50%) tambien a los ticks para alineación precisa
                                transform: `translate(${x}px, ${y}px) translateY(-50%) rotate(${-normalizedAngle}deg)`,
                                opacity: 1,
                                willChange: 'transform'
                            }}
                        />
                    );
                }
            }
        }

        return items;
    };

    return (
        <div
            ref={containerRef}
            className="month-wheel-container"
            style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
        >
            {renderItems()}
        </div>
    );
}
