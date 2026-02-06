# Makora - Contexto del Proyecto

## Descripción
Portfolio/laboratorio creativo con interfaz de rueda/jog dial estilo Apple. Página principal con rueda interactiva (derecha) + video del proyecto seleccionado (izquierda). Cada proyecto tiene página dedicada con layout 70/30.

## Proyectos en la rueda
`makora`, `ikra`, `alawal`, `enuma`, `aisac`, `mirilab`, `gdels`, `tousys`

### Concepto de cada proyecto (pendiente de implementar)
1. **makora** — Botón con estilo único (componente)
2. **ikra** — Notch estilo iOS (componente)
3. **alawal** — Arte generativo matemático (Canvas/WebGL)
4. **enuma** — Scroll animation de modelo 3D (Three.js)
5. **aisac** — Hover animation
6. **mirilab** — Componente estilo iOS
7. **gdels** — Particle morphing text (Canvas/WebGL)
8. **tousys** — Interactive fluid shader (WebGL/GLSL)

---

## Stack Técnico
- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Estilos**: Tailwind CSS 4 + CSS Variables
- **Fuente**: Inter (estilo Apple)
- **Animaciones**: JavaScript puro con `requestAnimationFrame` (no Framer Motion)

---

## Estructura de Archivos

```
app/
├── config/
│   └── wheel.config.ts          # Config centralizada (proyectos, geometría, interacción, videos)
├── hooks/
│   └── useWheelRotation.ts      # Hook para rotación, drag, scroll y snap
├── components/
│   └── ProjectWheel.tsx         # Componente de la rueda
├── projects/
│   └── [slug]/
│       └── page.tsx             # Página de proyecto (layout 70/30)
├── globals.css                  # Variables CSS y estilos
├── layout.tsx                   # Layout con fuente Inter
└── page.tsx                     # Página principal (video + rueda + footer)
public/
├── videoProject.webm            # Video placeholder 1
├── videoProject2.webm           # Video placeholder 2
└── jmakora.svg                  # Logo/marca personal
```

---

## Lo que está implementado

### Página principal (page.tsx)
- **Video** a la izquierda (26vw, max 380px) que cambia según proyecto seleccionado
- **Rueda** a la derecha
- **Footer** abajo-izquierda: logo jmakora.svg + links (portfolio, LinkedIn, Instagram)
- Video usa `key={videoSrc}` para remount limpio al cambiar proyecto

### Rueda (ProjectWheel)
- 8 proyectos + 3 ticks entre cada uno, `compressionFactor: 0.35`
- Radio: 550, posicionamiento en arco con trigonometría
- Opacidad progresiva por ángulo (curva coseno) — elementos se desvanecen hacia bordes
- Animación elastic-nudge al seleccionar (translate3d hacia derecha, 14px, GPU-accelerated)
- Ticks: 48px largo, 1px grosor. Nombres: font-weight 300
- `onProjectChange` callback para notificar cambio de selección al padre

### Interacción (useWheelRotation)
- **Drag**: Movimiento libre, snap al soltar
- **Scroll**: Discreto — 1 proyecto por notch
- **Snap**: Ease-out cúbica (150ms)
- **Inercia**: Fricción 0.9, snap al parar

### Selector
- `.wheel-selector` existe en DOM pero es invisible (sin fondo, sin líneas)

### Página de proyecto (projects/[slug]/page.tsx)
- Ruta dinámica, valida slug contra PROJECTS
- Layout flex: 70% canvas (izq) | 1px divider | 30% info (der)
- Canvas vacío listo para contenido interactivo
- Info muestra título por ahora

### Config (wheel.config.ts)
- `PROJECTS` array + `ProjectName` type
- `WHEEL_CONFIG`: radius 550, compression 0.35, ángulos auto-calculados con COMPRESSION_FACTOR DRY
- `INTERACTION_CONFIG`: drag, inercia, snap
- `PROJECT_VIDEOS`: Record<ProjectName, string> — mapeo proyecto→video

---

## Notas importantes
- Alineación proyectos/ticks: ambos usan `.wheel-base` con `left: 0` para empezar en mismo punto
- Scroll down = rueda baja
- Videos: `videoProject.webm` y `videoProject2.webm` son placeholders, se alternan entre proyectos
- Footer links: portfolio (josencv.vercel.app), LinkedIn, Instagram
- CSS usa `!important` en `.bottom-bar` y `.brand-logo` por conflictos de especificidad
