// Configuración centralizada de la rueda de proyectos
// Modifica estos valores para ajustar el comportamiento y apariencia

export const PROJECTS = [
  "makora",
  "ikra",
  "opendom",
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
  opendom:  "/videoProject.webm",
  enuma:   "/videoProject2.webm",
  aisac:   "/videoProject.webm",
  mirilab: "/videoProject2.webm",
  gdels:   "/videoProject.webm",
  tousys:  "/videoProject2.webm",
};

// Configuración de interacción
export const INTERACTION_CONFIG = {
  dragSensitivity: 0.15,
};
