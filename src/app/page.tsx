import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

const steps = [
  {
    title: "Importer le master",
    text: "Déposez une prise déjà filmée. FrameShift lit durée, cadre et texture.",
  },
  {
    title: "Diriger la transformation",
    text: "Restyle, motion, remix rythme ou extension — plus un prompt de intention.",
  },
  {
    title: "Exporter la nouvelle coupe",
    text: "Grade, titres et pacing appliqués. Prêt à publier ou à raffiner.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="hero-plane absolute inset-0 animate-[shimmer_12s_linear_infinite] bg-[length:120%_120%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-foam" />
        <SiteNav />

        <div className="relative z-10 flex min-h-[calc(100svh-88px)] flex-col justify-end px-5 pb-16 pt-10 md:px-10 md:pb-20">
          <p className="mb-4 max-w-xl font-display text-5xl font-extrabold leading-[0.92] tracking-tight text-white md:text-7xl lg:text-8xl animate-reveal">
            FrameShift
          </p>
          <h1 className="max-w-2xl text-2xl font-medium leading-snug text-white/95 md:text-3xl animate-reveal [animation-delay:120ms]">
            Transformez une vidéo déjà tournée en une nouvelle version dirigée par l’IA.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg animate-reveal [animation-delay:220ms]">
            Partez de votre rush. Recolorez, rythmez, ajoutez du motion design ou prolongez la scène.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-reveal [animation-delay:320ms]">
            <Link href="/studio" className="btn-primary bg-white text-ink hover:bg-mist">
              Commencer avec un master
            </Link>
            <a href="#methode" className="btn-ghost text-white border-white/25 bg-white/10 hover:bg-white/20">
              Voir la méthode
            </a>
          </div>
        </div>
      </section>

      <section id="methode" className="section-space py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Une intention. Un master. Une nouvelle coupe.
          </h2>
          <p className="mt-4 text-lg text-slate">
            Conçu pour les monteurs et motion designers qui veulent itérer vite sans perdre le plan source.
          </p>
        </div>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="animate-drift" style={{ animationDelay: `${index * 0.4}s` }}>
              <p className="font-display text-sm font-semibold text-tide">0{index + 1}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-slate">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-space pb-24">
        <div className="relative overflow-hidden rounded-none film-edge bg-ink px-6 py-12 text-white md:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-tide/40 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-40 w-40 rounded-full bg-ember/30 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold md:text-4xl">
            Votre vidéo existante est le point de départ.
          </h2>
          <p className="relative mt-3 max-w-xl text-white/75">
            Pipeline local director (ffmpeg) prêt à l’emploi. Branchez Replicate pour du vrai video-to-video cloud.
          </p>
          <Link href="/studio" className="btn-primary relative mt-8 bg-white text-ink hover:bg-mist">
            Entrer dans le studio
          </Link>
        </div>
      </section>
    </main>
  );
}
