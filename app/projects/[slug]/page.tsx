import { notFound } from "next/navigation";
import { PROJECTS } from "@/app/config/wheel.config";
import ChaosAttractor from "@/app/components/projects/opendom/ChaosAttractor";
import CielProject from "@/app/components/projects/ciel/CielProject";
import type { ComponentType } from "react";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

// Mapeo de slug → componente de proyecto
const PROJECT_COMPONENTS: Partial<Record<string, ComponentType>> = {
  opendom: ChaosAttractor,
  ciel: CielProject,
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (!PROJECTS.includes(slug as (typeof PROJECTS)[number])) {
    notFound();
  }

  const Component = PROJECT_COMPONENTS[slug];

  return (
    <div className="project-page">
      {Component ? (
        <Component />
      ) : (
        <>
          <div className="project-canvas" />
          <div className="project-divider" />
          <div className="project-info">
            <h1 className="project-info__title">{slug}</h1>
          </div>
        </>
      )}
    </div>
  );
}
