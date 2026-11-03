import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Blues Games" }, { name: "description", content: "How Blues Games handles accounts, comments, likes, play history and AI recommendations." }, { property: "og:title", content: "Privacy Policy — Blues Games" }, { property: "og:description", content: "How Blues Games handles your data." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <LegalPage title="Privacy Policy" sections={[
    ["Accounts", "You can play every game without an account. If you sign up, we store your email address, display name and account preferences so you can sign in and keep your likes. You can change your display name or sign out from your profile page at any time."],
    ["Comments", "Comments you post are public. We store the comment text, your display name, the game it belongs to and when it was posted. You can delete your own comments at any time."],
    ["Likes", "As a guest, liked games are saved only in this browser. When signed in, your likes are saved to your account so they follow you across devices."],
    ["Recently played and game saves", "Your recently played list and game progress are saved only in this browser. We do not upload them. You can clear recently played in Settings, or clear your browser data to remove everything."],
    ["AI game recommendations", "To suggest games, the names of games you recently played are sent to an AI service, which returns suggestions. No email, name or other personal details are sent. Results are cached for a short time to avoid repeat requests."],
    ["Reports", "When you report a game we store the reason, any details you write, and your account ID if you are signed in, so we can fix broken games."],
    ["Third parties", "Games are loaded from public sources and may set their own storage inside your browser. We do not sell your data or show advertising."],
    ["Contact", "Questions about your data or requests to delete your account can be sent to the site owner."],
  ]} />,
});
