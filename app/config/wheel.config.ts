// Configuración centralizada de la rueda de proyectos
// Modifica estos valores para ajustar el comportamiento y apariencia

export const PROJECTS = [
  "makora",
  "ikra",
  "alawal",
  "enuma",
  "aisac",
  "mirilab",
  "gdels",
  "tousys",
] as const;

export type ProjectName = (typeof PROJECTS)[number];

// Valores base
const TOTAL_PROJECTS = PROJECTS.length;
const TICKS_PER_PROJECT = 3;
const SLOTS_PER_PROJECT = TICKS_PER_PROJECT + 1;
const TOTAL_SLOTS = TOTAL_PROJECTS * SLOTS_PER_PROJECT;

// Configuración de geometría de la rueda
export const WHEEL_CONFIG = {
  // Radio del círculo (menor = mayor curvatura)
  radius: 650,

  // Ángulo máximo visible en grados (arco de visualización)
  maxVisibleAngle: 50,

  // Margen extra para el culling de elementos
  visibilityMargin: 5,

  // Número de ticks entre cada proyecto (menos = más junto)
  ticksPerProject: TICKS_PER_PROJECT,

  // Factor de compresión (menor = elementos más juntos)
  compressionFactor: 0.5,

  // Valores calculados
  totalProjects: TOTAL_PROJECTS,
  anglePerProject: (360 / TOTAL_PROJECTS) * 0.5,
  slotsPerProject: SLOTS_PER_PROJECT,
  totalSlots: TOTAL_SLOTS,
  anglePerSlot: (360 / TOTAL_SLOTS) * 0.5,
};

// Configuración de interacción
export const INTERACTION_CONFIG = {
  // Factor de sensibilidad del scroll con rueda del mouse
  wheelSensitivity: 0.05,

  // Factor de sensibilidad del drag
  dragSensitivity: 0.15,

  // Fricción para la inercia (0-1, mayor = menos fricción)
  inertiaFriction: 0.96,

  // Umbral mínimo de velocidad para detener la inercia
  inertiaThreshold: 0.01,
};

// Configuración de posicionamiento
export const POSITION_CONFIG = {
  // Distancia desde el borde derecho
  rightOffset: 80,

  // Ancho del contenedor
  containerWidth: 300,

  // Offset interno de los elementos
  itemOffset: 20,

  // Ancho del tick (para centrar proyectos)
  tickWidth: 24,
};
