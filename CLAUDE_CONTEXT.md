# Makora - Contexto del Proyecto

## Descripción
Portfolio personal con interfaz de rueda/jog dial estilo Apple. La página principal muestra una rueda interactiva con 8 proyectos que funciona como selector.

## Proyectos en la rueda
`makora`, `ikra`, `alawal`, `enuma`, `aisac`, `mirilab`, `gdels`, `tousys`

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
│   └── wheel.config.ts      # Configuración centralizada (proyectos, geometría, interacción)
├── hooks/
│   └── useWheelRotation.ts  # Hook para rotación, drag, scroll y snap
├── components/
│   └── ProjectWheel.tsx     # Componente de la rueda
├── globals.css              # Variables CSS y estilos
├── layout.tsx               # Layout con fuente Inter
└── page.tsx                 # Página principal
```

---

## Lo que está implementado

### Rueda (ProjectWheel)
- 8 proyectos + 3 ticks entre cada uno
- Posicionamiento en arco usando trigonometría
- Elementos visibles solo en el arco visible (optimización)
- Rueda infinita (wrap around)
- Compresión de ángulos (`compressionFactor: 0.5`) para elementos más juntos

### Interacción (useWheelRotation)
- **Drag**: Movimiento libre mientras arrastras, snap al soltar
- **Scroll**: Discreto - cada scroll mueve exactamente 1 elemento
- **Snap**: Animación ease-out cúbica estilo Apple (150ms)
- **Inercia**: Al soltar drag con velocidad, inercia corta y luego snap

### Selector
- Área visual en el centro (`.wheel-selector`)
- Líneas superior e inferior con gradiente
- Elemento seleccionado a opacidad 100%, resto al 40%

### Estilos
- Variables CSS centralizadas en `:root`
- Fuente Inter
- Fondo negro, texto blanco

---

## Configuración actual (wheel.config.ts)

```typescript
WHEEL_CONFIG = {
  radius: 650,
  maxVisibleAngle: 50,
  compressionFactor: 0.5,
  ticksPerProject: 3,
  // ... valores calculados automáticamente
}

INTERACTION_CONFIG = {
  dragSensitivity: 0.15,
  inertiaFriction: 0.96,
  snapDuration: 400,
  // ...
}
```

---

## Variables CSS importantes

```css
--wheel-right-offset: 190px;    /* Posición horizontal de la rueda */
--wheel-tick-width: 32px;       /* Largo de los ticks */
--wheel-project-font-size: 16px;
--wheel-selector-height: 40px;
```

---

## Problema resuelto importante

**Alineación de proyectos y ticks**: Los nombres de proyecto y los ticks deben EMPEZAR en el mismo punto (no terminar). Solución:
- Ambos usan contenedor `.wheel-base` con mismo `right`
- Hijos con `position: absolute; left: 0;` para que empiecen en el mismo punto

---

## Notas de desarrollo

- El scroll y drag funcionan correctamente después de varios ajustes
- La dirección del scroll: scroll down = rueda baja (elementos suben visualmente)
- El snap debe ser rápido (150ms) para sentirse responsive
- La inercia usa fricción 0.9 para parar rápido antes del snap
