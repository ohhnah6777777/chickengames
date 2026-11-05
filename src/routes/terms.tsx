import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Kootz Games" }, { name: "description", content: "The rules for using Kootz Games, accounts, comments and recommendations." }, { property: "og:title", content: "Terms of Service — Kootz Games" }, { property: "og:description", content: "The rules for using Kootz Games." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <LegalPage title="Terms of Service" sections={[
    ["Using Kootz Games", "Kootz Games is a free site for playing browser games. By using it you agree to these terms. The site is provided as is, and games may change, break or be removed at any time."],
    ["Accounts", "Accounts are optional. You are responsible for keeping your login safe and for anything posted from your account. We may suspend accounts that break these rules."],
    ["Comments", "Be kind. Do not post hateful, harassing, sexual, violent or spam content, or personal information about anyone. We may remove any comment and you can delete your own."],
    ["Likes, history and saves", "Likes, recently played games and game progress are features for your convenience. Guest data lives in your browser and can be lost if you clear it. We do not guarantee any saved data."],
    ["AI game recommendations", "Suggestions are generated automatically from your recently played games. They may be inaccurate or not to your taste and are not endorsements."],
    ["Games and content", "Games are made by their original creators and remain their property. If you own a game and want it removed, contact the site owner and it will be taken down."],
    ["Changes", "We may update these terms. Continuing to use the site means you accept the latest version."],
  ]} />,
});
