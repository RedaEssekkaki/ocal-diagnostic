import type { ApiResponse } from "../types";
import { MacroDonut } from "./MacroDonut";
import { MealsTable } from "./MealsTable";
import { Icon } from "@/components/ui/icon";

function DailyMetric({ label, value, unit, hint }: { label: string; value: number; unit: string; hint?: string }) {
  return (
    <div className="min-h-[104px] rounded-md border border-line bg-white p-4 shadow-[var(--shadow-e1)]">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 flex flex-wrap items-end gap-x-1">
        <span className="text-2xl font-semibold leading-none text-label-default">{value}</span>
        <span className="text-sm font-medium text-muted">{unit}</span>
      </div>
      {hint && <div className="mt-2 text-xs leading-snug text-muted">{hint}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 font-title text-2xl uppercase leading-tight tracking-wide text-dark-green sm:text-3xl">
      {children}
    </h2>
  );
}

export function ResultsView({ data }: { data: ApiResponse }) {
  const { targets: t, meals } = data;
  const sign = t.weekly_change_kg > 0 ? "+" : "";
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle>Cibles journalières</SectionTitle>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-md border border-line bg-white p-5 shadow-[var(--shadow-e2)] sm:p-6">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" aria-hidden="true" />
            <div className="flex h-full flex-col justify-between gap-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-primary-strong">Cible journalière</div>
                <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
                  <span className="font-title text-4xl leading-none text-dark-green sm:text-5xl">
                    {Math.round(t.calories)}
                  </span>
                  <span className="pb-1 text-lg font-semibold text-muted">kcal/j</span>
                </div>
              </div>
              <div className="inline-flex w-fit rounded-full bg-green-pale px-3 py-1 text-sm font-semibold text-dark-green">
                {t.pace} · {sign}
                {t.weekly_change_kg.toFixed(3)} kg/sem
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DailyMetric label="BMR" value={Math.round(t.bmr)} unit="kcal" hint={t.bmr_method} />
            <DailyMetric label="NEAT" value={Math.round(t.neat_kcal)} unit="kcal" />
            <DailyMetric label="Sport" value={Math.round(t.sport_kcal)} unit="kcal/j" />
            <DailyMetric label="TDEE" value={Math.round(t.tdee)} unit="kcal" />
          </div>
        </div>
        {t.infos && t.infos.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {t.infos.map((info, i) => (
              <div
                key={i}
                className="flex items-start gap-2 self-start rounded-sm bg-info-pale px-3 py-2 text-sm text-info-strong"
              >
                <Icon name="info" size={18} filled className="mt-0.5 shrink-0" />
                <span>{info}</span>
              </div>
            ))}
          </div>
        )}
        {t.warnings.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {t.warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 self-start rounded-sm bg-warning-pale px-3 py-2 text-sm text-warning-strong"
              >
                <Icon name="warning" size={18} filled className="mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Macros</SectionTitle>
        <div className="card px-6 py-7 sm:p-8">
          <MacroDonut t={t} />
        </div>
      </section>

      <section>
        <SectionTitle>Répartition des repas</SectionTitle>
        <div className="card">
          <MealsTable meals={meals} />
        </div>
      </section>
    </div>
  );
}
