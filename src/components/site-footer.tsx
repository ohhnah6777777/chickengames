import { Link } from "@tanstack/react-router";
export function SiteFooter({ count }: { count: number }) {
  const rounded = Math.floor(count / 50) * 50;
  return (
    <footer className="mt-10 border-t border-border bg-card/60">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-10 text-center">
        <img src="/mascot.webp" alt="" width={72} height={72} className="size-18 rounded-2xl object-contain drop-shadow-[0_0_14px_var(--glow)]" />
        <h2 className="brand-title text-3xl">Kootz Games</h2>
        <p className="text-muted-foreground">Free Unblocked Games Online</p>
        <p className="text-left leading-relaxed text-foreground/85">
          Kootz Games hosts {rounded}+ browser games, plays instantly with no downloads, saves your progress automatically, and suggests new games based on what you've played — so you can jump right in from any computer, including your school Chromebook.
        </p>
        <nav className="flex gap-6 pt-2 font-display text-lg font-bold">
          <Link to="/terms" className="text-primary drop-shadow-[0_0_10px_var(--glow)] hover:underline">Terms of Service</Link>
          <Link to="/privacy" className="text-primary drop-shadow-[0_0_10px_var(--glow)] hover:underline">Privacy Policy</Link>
        </nav>
      </div>
      <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Kootz Games. All rights reserved.</div>
    </footer>
  );
}
