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
const COMPRESSION_FACTOR = 0.35;

// Configuración de geometría de la rueda
export const WHEEL_CONFIG = {
  radius: 550,
  maxVisibleAngle: 50,
  visibilityMargin: 5,
  ticksPerProject: TICKS_PER_PROJECT,
  compressionFactor: COMPRESSION_FACTOR,

  // Valores calculados
  totalProjects: TOTAL_PROJECTS,
  anglePerProject: (360 / TOTAL_PROJECTS) * COMPRESSION_FACTOR,
  slotsPerProject: SLOTS_PER_PROJECT,
  totalSlots: TOTAL_SLOTS,
  anglePerSlot: (360 / TOTAL_SLOTS) * COMPRESSION_FACTOR,
};

// Video asociado a cada proyecto (mismo orden que PROJECTS)
export const PROJECT_VIDEOS: Record<ProjectName, string> = {
  makora:  "/videoProject.webm",
  ikra:    "/videoProject2.webm",
  alawal:  "/videoProject.webm",
  enuma:   "/videoProject2.webm",
  aisac:   "/videoProject.webm",
  mirilab: "/videoProject2.webm",
  gdels:   "/videoProject.webm",
  tousys:  "/videoProject2.webm",
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

  // Snap (efecto pegajoso)
  snapEnabled: true,
  snapDuration: 400, // ms - duración de la animación de snap
  snapThreshold: 0.5, // velocidad mínima para activar snap después de inercia
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
