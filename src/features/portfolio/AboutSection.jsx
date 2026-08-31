import { GithubIcon, LinkedInIcon } from '../../components/common/BrandIcons'
import { SocialLink } from '../../components/common/SocialLink'

export function AboutSection({ profile }) {
  return (
    <section id="about" className="section grid min-h-[75vh] items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
      <div>
        <p className="eyebrow">Xin chào, tôi là</p>
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">{profile.fullName}</h1>
        <p className="mt-5 text-2xl font-semibold text-accent">{profile.headline}</p>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{profile.bio}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="rounded-xl bg-ink px-6 py-3 font-semibold text-white hover:bg-accent" href="#contact">Liên hệ tôi</a>
          <SocialLink url={profile.githubUrl} label="GitHub"><GithubIcon size={18} /></SocialLink>
          <SocialLink url={profile.linkedinUrl} label="LinkedIn"><LinkedInIcon size={18} /></SocialLink>
        </div>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-500 to-cyan-400 p-2 shadow-2xl">
        {profile.avatarUrl ? (
          <img className="h-full w-full rounded-[2.1rem] object-cover" src={profile.avatarUrl} alt={profile.fullName} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-[2.1rem] bg-ink text-8xl font-extrabold text-white">{profile.fullName.charAt(0)}</div>
        )}
      </div>
    </section>
  )
}
