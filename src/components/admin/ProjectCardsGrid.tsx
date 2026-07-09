import Image from "next/image";
import Link from "next/link";
import type { ProjectRow } from "@/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function projectStatus(project: ProjectRow) {
  const status = project.status ?? (project.is_published ? "published" : "draft");
  return status === "archived" ? "draft" : status;
}

type ProjectCardsGridProps = {
  projects: ProjectRow[];
  canDelete: boolean;
};

export function ProjectCardsGrid({ projects, canDelete }: ProjectCardsGridProps) {
  if (projects.length === 0) {
    return <p className="dash-empty">No projects yet. Create your first project.</p>;
  }

  return (
    <div className="dash-project-grid">
      {projects.map((project) => {
        const status = projectStatus(project);
        const goal = Number(project.goal_amount ?? 0);
        const raised = Number(project.amount_raised ?? 0);
        const progress = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;

        return (
          <article key={project.slug} className="dash-project-card">
            <div className="dash-project-card-media">
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 700px) 100vw, 33vw"
                unoptimized={project.image_url.includes("cdn.prod.website-files.com")}
              />
            </div>
            <div className="dash-project-card-body">
              <h3 className="dash-project-card-title">{project.title}</h3>
              <div className="dash-project-card-meta">
                <span>{project.category_slug}</span>
                <span>•</span>
                <span>{status}</span>
              </div>
              {goal > 0 ? (
                <>
                  <div className="dash-project-rank-meta">
                    <span>{formatMoney(raised)} raised</span>
                    <span>Goal {formatMoney(goal)}</span>
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              ) : null}
              <div className="dash-project-card-actions">
                <Link
                  href={`/admin/projects/${project.slug}`}
                  className="dash-btn dash-btn--primary"
                >
                  Edit
                </Link>
                <Link
                  href={`/project/${project.slug}`}
                  className="dash-btn"
                  target="_blank"
                >
                  Preview
                </Link>
                {canDelete ? (
                  <Link
                    href={`/admin/projects/${project.slug}?delete=1`}
                    className="dash-btn dash-btn--danger"
                  >
                    Delete
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
