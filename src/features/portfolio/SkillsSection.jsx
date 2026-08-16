import { Section } from '../../components/common/Section'

export function SkillsSection({ skills }) {
  return (
    <Section id="skills" eyebrow="Năng lực" title="Kỹ năng">
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <div className="card" key={skill.id}>
            <div className="flex justify-between"><b>{skill.name}</b><span className="text-sm text-slate-500">{skill.category}</span></div>
            <div className="mt-4 h-2 rounded bg-slate-100">
              <div className="h-2 rounded bg-accent" style={{ width: `${skill.proficiency}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
