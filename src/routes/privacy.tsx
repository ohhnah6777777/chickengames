import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Kootz Games" }, { name: "description", content: "How Kootz Games handles accounts, comments, likes, play history and AI recommendations." }, { property: "og:title", content: "Privacy Policy — Kootz Games" }, { property: "og:description", content: "How Kootz Games handles your data." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <LegalPage title="Privacy Policy" sections={[
    ["Accounts", "Kootz Games uses a local account only — there is no sign up or log in. Your display name and preferences are stored only in this browser, never on our servers, and you can change your display name on your profile page at any time."],
    ["Comments", "Comments you post are public. We store the comment text, the display name from your local profile, the game it belongs to and when it was posted."],
    ["Likes", "Liked games are saved only in this browser as part of your local profile. Clearing your browser data removes them."],
    ["Recently played and game saves", "Your recently played list and game progress are saved only in this browser. We do not upload them. You can clear recently played in Settings, or clear your browser data to remove everything."],
    ["AI game recommendations", "To suggest games, the names of games you recently played are sent to an AI service, which returns suggestions. No email, name or other personal details are sent. Results are cached for a short time to avoid repeat requests."],
    ["Reports", "When you report a game we store the reason and any details you write, so we can fix broken games. Reports are not tied to any account."],
    ["Third parties", "Games are loaded from public sources and may set their own storage inside your browser. We do not sell your data or show advertising."],
    ["Contact", "Questions about your data can be sent to the site owner. To remove your local profile, clear your browser data."],
  ]} />,
});
