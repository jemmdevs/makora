import { notFound } from "next/navigation";
import { PROJECTS } from "@/app/config/wheel.config";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (!PROJECTS.includes(slug as typeof PROJECTS[number])) {
    notFound();
  }

  return (
    <div className="project-page">
      <div className="project-canvas">
        {/* Aquí irá el componente interactivo de cada proyecto */}
      </div>
      <div className="project-divider" />
      <div className="project-info">
        <h1 className="project-info__title">{slug}</h1>
      </div>
    </div>
  );
}
