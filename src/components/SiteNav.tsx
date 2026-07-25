import Link from "next/link";

export function SiteNav({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={`relative z-20 flex items-center justify-between px-5 py-5 md:px-10 ${
        solid ? "text-ink" : "text-white"
      }`}
    >
      <Link href="/" className="font-display text-xl font-bold tracking-tight md:text-2xl">
        FrameShift
      </Link>
      <nav className="flex items-center gap-3 md:gap-5">
        <a
          href="#methode"
          className={`hidden text-sm md:inline ${solid ? "text-slate" : "text-white/80"}`}
        >
          Méthode
        </a>
        <Link
          href="/studio"
          className={
            solid
              ? "btn-primary"
              : "inline-flex items-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
          }
        >
          Ouvrir le studio
        </Link>
      </nav>
    </header>
  );
}
