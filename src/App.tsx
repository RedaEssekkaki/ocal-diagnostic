import { useState } from "react";
import type { ProfileIn, ApiResponse } from "./types";
import { postTargets } from "./api";
import { ProfileForm, EMPTY_PROFILE } from "./components/ProfileForm";
import { ResultsView } from "./components/ResultsView";
import { Footer } from "./components/Footer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

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
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-dark-green">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Ocal Nutrition"
            className="h-14 w-auto object-contain sm:h-16"
          />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {result ? (
          <div>
            <div className="mb-6">
              <Button
                variant="text"
                onClick={() => setResult(null)}
                leftIcon={<Icon name="arrow_back" size={20} />}
              >
                Modifier mes informations
              </Button>
            </div>
            <ResultsView data={result} />
          </div>
        ) : (
          <>
            <ProfileForm initial={EMPTY_PROFILE} onSubmit={handleSubmit} loading={loading} />

            {error && (
              <div className="mt-6 chip bg-error-pale text-error-strong">Erreur : {error}</div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
