import { Section } from '../../components/common/Section'

export function ExperienceSection({ experiences }) {
  return (
    <Section id="experience" eyebrow="Hành trình" title="Kinh nghiệm">
      <div className="mt-10 space-y-5">
        {experiences.map((experience) => (
          <article className="card" key={experience.id}>
            <p className="text-sm font-semibold text-accent">{experience.startDate} — {experience.endDate || 'Hiện tại'}</p>
            <h3 className="mt-2 text-xl font-bold">{experience.position}</h3>
            <p className="font-medium text-slate-500">{experience.company}</p>
            <p className="mt-4 leading-7 text-slate-600">{experience.description}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
