# Makora - Contexto del Proyecto

## Descripción
Portfolio/laboratorio creativo con interfaz de rueda/jog dial estilo Apple. Página principal con rueda interactiva (derecha) + video del proyecto seleccionado (izquierda). Cada proyecto tiene página dedicada con layout 70/30 (canvas | divider 1px | info panel).

## Stack
Next.js 16.1.6 (App Router) · React 19.2.3 · Tailwind CSS 4 · Inter · JS puro con `requestAnimationFrame`

## Proyectos
`makora`, `ikra`, `opendom`, `enuma`, `aisac`, `mirilab`, `gdels`, `ciel`

| Proyecto | Estado | Concepto |
|----------|--------|----------|
| makora | pendiente | Botón con estilo único |
| ikra | pendiente | Notch estilo iOS |
| opendom | ✅ | Atractores extraños (Lorenz, Aizawa, Thomas) — Canvas 2D |
| enuma | pendiente | Scroll animation 3D (Three.js) |
| aisac | pendiente | Hover animation |
| mirilab | pendiente | Componente estilo iOS |
| gdels | pendiente | Particle morphing text |
| ciel | ✅ | Gravity + Wormhole + Dimensions — Canvas 2D |

---

## Estructura

```
app/
├── config/wheel.config.ts       # PROJECTS, WHEEL_CONFIG, INTERACTION_CONFIG, PROJECT_VIDEOS
├── hooks/useWheelRotation.ts    # Drag, scroll, snap, inercia
├── components/
│   ├── ProjectWheel.tsx         # Rueda (arco trigonométrico, opacidad coseno, elastic-nudge)
│   └── projects/
│       ├── opendom/             # ChaosAttractor.tsx, ChaosRenderer.ts, attractors.ts
│       └── ciel/                # CielProject.tsx, simulations.ts, GravityRenderer.ts,
│                                # WormholeRenderer.ts, DimensionRenderer.ts
├── projects/[slug]/page.tsx     # Routing dinámico → PROJECT_COMPONENTS map
├── globals.css                  # CSS variables, rueda, controles (chaos-*), proyecto
├── layout.tsx · page.tsx
public/
├── videoProject.webm · videoProject2.webm (placeholders, se alternan)
└── jmakora.svg
```

---

## Implementación clave

### Rueda (home)
- 8 proyectos + 3 ticks entre cada uno, radio 550, compression 0.35
- Scroll discreto (1 proyecto/notch), drag con inercia (fricción 0.9), snap ease-out 150ms
- Video izquierda cambia con `key={videoSrc}` al seleccionar proyecto
- Footer: logo jmakora.svg + links (portfolio, LinkedIn, Instagram)

### OpenDom — Chaos Theory
- `ChaosRenderer.ts`: 2500 partículas, integración RK4, proyección 3D con rotación, trail fade overlay
- `attractors.ts`: Lorenz, Aizawa, Thomas (solve + params configurables)
- Trazadores de divergencia (sensibilidad a condiciones iniciales)
- Acciones: Divergence, Perturb, Reset

### Ciel — Simulaciones físicas/matemáticas
Arquitectura extensible: interfaz `SimulationRenderer` (start/stop/destroy/resize/updateParams/action), factory de renderers en `CielProject.tsx`, definiciones en `simulations.ts`.

**Gravity** (N-Body Problem)
- 3 cuerpos iniciales (max 12) + 600 polvo, Velocity Verlet + Euler
- F = G·m₁·m₂/(r²+ε²), softening, glow radial, trail fade
- Cámara auto-zoom: sigue COM, escala para mantener todos los cuerpos visibles
- Acciones: Add Body, Perturb, Reset

**Wormhole** (Gravitational Lensing)
- 2000 estrellas, lente delgada: θ±=(β±√(β²+4θ²_E))/2
- Imagen primaria + secundaria, Einstein ring, photon ring glow, sombra central
- Lente sigue cursor (lerp) + órbita Lissajous en idle
- Clear-and-redraw cada frame

**Dimensions** (4D Geometry)
- Tesseract: 16 vértices, 32 aristas, rotación XW + YZ + XZ lenta acoplada
- Doble proyección perspectiva 4D→3D→2D, trail fade
- Vértices glow azul-blanco, aristas opacidad por profundidad

---

## Notas
- CSS controles (`chaos-*`) reutilizados por OpenDom y Ciel
- Slider: `padding: 8px 0` para hit area amplia manteniendo visual 1px
- Reset en Ciel: resetea params a defaults antes de reiniciar renderer
- Videos placeholder se alternan entre proyectos
- CSS usa `!important` en `.bottom-bar` y `.brand-logo` por especificidad
