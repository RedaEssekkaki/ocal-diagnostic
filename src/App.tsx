import { useState } from "react";
import type { ProfileIn, ApiResponse } from "./types";
import { postTargets } from "./api";
import { ProfileForm } from "./components/ProfileForm";
import { ResultsView } from "./components/ResultsView";

const DEFAULT_PROFILE: ProfileIn = {
  sex: "M",
  age: 26,
  weight_kg: 75,
  height_cm: 177,
  objective: "prise_muscle",
  sessions: [
    { sport: "Musculation", minutes: 75, per_week: 4, intensity: "elevee" },
  ],
  activity_level: "leger",
  steps: 9000,
  pace: "doux",
  bodyfat_pct: 12,
  diet: "omnivore",
  is_athlete: false,
  breakfast: "complet",
  main_meal: "equilibre",
};

export default function App() {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(p: ProfileIn) {
    setLoading(true);
    setError(null);
    try {
      const r = await postTargets(p);
      setResult(r);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-[#12351E]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <img
              src="/logo.png"
              alt="Ocal Nutrition"
              className="h-16 w-auto object-contain sm:h-24 md:h-28"
            />
            <img
              src="/mascot.png"
              alt="Mascotte Ocal Nutrition"
              className="h-24 w-auto object-contain sm:h-32 md:h-40"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <ProfileForm initial={DEFAULT_PROFILE} onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="mt-6 chip bg-red-100 text-red-900">Erreur : {error}</div>
        )}

        {result && (
          <div id="results" className="mt-10 pt-8 border-t border-slate-200">
            <ResultsView data={result} />
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-ocal-muted py-6">
        Ocal Nutrition · calcul personnalisé selon ton profil
      </footer>
    </div>
  );
}
