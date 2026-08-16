import { ExternalLink } from '../../components/common/ExternalLink'
import { Section } from '../../components/common/Section'

export function ProjectsSection({ projects }) {
  return (
    <Section id="projects" eyebrow="Sản phẩm" title="Dự án nổi bật">
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article className="card" key={project.id}>
            {project.imageUrl && <img className="mb-5 aspect-video w-full rounded-xl object-cover" src={project.imageUrl} alt={project.title} />}
            <h3 className="text-xl font-bold">{project.title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{project.description}</p>
            <p className="mt-4 text-sm font-semibold text-accent">{project.technologies}</p>
            <div className="mt-5 flex gap-4">
              {project.demoUrl && <ExternalLink url={project.demoUrl} label="Demo" />}
              {project.sourceUrl && <ExternalLink url={project.sourceUrl} label="Source" />}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
