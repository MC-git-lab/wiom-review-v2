import reviews from "./data/reviews.json";
import Dashboard from "./Dashboard";
import ThemeToggle from "./ThemeToggle";
import WiomLogo from "./WiomLogo";

export default function Page() {
  return (
    <>
      <header className="border-b border-pink-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-2">
          <WiomLogo />
          <span className="font-logo text-2xl font-extrabold tracking-tight text-[#ec0a7a] dark:text-white">
            Review Project
          </span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <Dashboard reviews={reviews as any} />
      </main>
      <footer className="border-t border-pink-100 dark:border-neutral-800">
        <div className="mx-auto max-w-4xl px-4 py-4 text-center text-xs text-[#8a5570] dark:text-neutral-400">
          Reviews collected from Google Play Store and YouTube. Sentiment and review type are
          assigned by content-based heuristics, not just star rating.
        </div>
      </footer>
    </>
  );
}
