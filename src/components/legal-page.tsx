import { Link } from "@tanstack/react-router";
export function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/" className="text-sm font-bold text-primary">← Back to Blues Games</Link>
      <h1 className="brand-title mt-4 text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated November 2026</p>
      {sections.map(([h, b]) => <section key={h} className="mt-6"><h2 className="font-display text-xl font-bold text-primary">{h}</h2><p className="mt-2 leading-relaxed text-foreground/85">{b}</p></section>)}
    </main>
  );
}
