import type { ApiResponse } from "../types";
import { MacroDonut } from "./MacroDonut";
import { MealsTable } from "./MealsTable";

function StatCard({ label, value, unit, hint }: { label: string; value: number | string; unit?: string; hint?: string }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">
        {value}
        {unit && <span className="text-base font-normal text-slate-500 ml-1">{unit}</span>}
      </div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

export function ResultsView({ data }: { data: ApiResponse }) {
  const { targets: t, meals } = data;
  const sign = t.weekly_change_kg > 0 ? "+" : "";
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="text-lg font-semibold mb-3">Cibles journalières</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="BMR" value={Math.round(t.bmr)} unit="kcal" hint={t.bmr_method} />
          <StatCard label="NEAT" value={Math.round(t.neat_kcal)} unit="kcal" />
          <StatCard label="Sport" value={Math.round(t.sport_kcal)} unit="kcal/j" />
          <StatCard label="TDEE" value={Math.round(t.tdee)} unit="kcal" />
          <StatCard label="Cible" value={Math.round(t.calories)} unit="kcal/j" hint={`${t.pace} · ${sign}${t.weekly_change_kg.toFixed(3)} kg/sem`} />
          <StatCard label="Fiabilité" value={`${t.confidence}/100`} />
        </div>
        {t.warnings.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {t.warnings.map((w, i) => (
              <div key={i} className="chip bg-amber-100 text-amber-900 self-start">⚠ {w}</div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Macros</h2>
        <MacroDonut t={t} />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Répartition des repas</h2>
        <MealsTable meals={meals} />
      </section>
    </div>
  );
}
