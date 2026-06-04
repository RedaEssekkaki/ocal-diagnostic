import type { SessionIn } from "../types";
import { SPORTS_BY_CATEGORY, INTENSITIES_BY_SPORT } from "../sports";

interface Props {
  sessions: SessionIn[];
  onChange: (s: SessionIn[]) => void;
}

const emptySession: SessionIn = {
  sport: "Musculation",
  minutes: 60,
  per_week: 3,
  intensity: null,
};

export function SessionsField({ sessions, onChange }: Props) {
  const update = (i: number, patch: Partial<SessionIn>) => {
    const next = sessions.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange(next);
  };
  const add = () => onChange([...sessions, { ...emptySession }]);
  const remove = (i: number) => onChange(sessions.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {sessions.length === 0 && (
        <p className="text-sm text-slate-500 italic">Aucune séance — le moteur calculera sur la base de l'activité quotidienne uniquement.</p>
      )}
      {sessions.map((s, i) => {
        const intensities = INTENSITIES_BY_SPORT[s.sport] ?? [];
        return (
          <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="field col-span-12 sm:col-span-4">
                <label>Sport</label>
                <select
                  value={s.sport}
                  onChange={(e) => update(i, { sport: e.target.value, intensity: null })}
                >
                  {Object.entries(SPORTS_BY_CATEGORY).map(([cat, sports]) => (
                    <optgroup key={cat} label={cat}>
                      {sports.map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="field col-span-6 sm:col-span-2">
                <label>Durée (min)</label>
                <input
                  type="number" min={1} max={600}
                  value={s.minutes}
                  onChange={(e) => update(i, { minutes: Number(e.target.value) })}
                />
              </div>
              <div className="field col-span-6 sm:col-span-2">
                <label>/ semaine</label>
                <input
                  type="number" min={1} max={21}
                  value={s.per_week}
                  onChange={(e) => update(i, { per_week: Number(e.target.value) })}
                />
              </div>
              <div className="field col-span-9 sm:col-span-3">
                <label>Intensité (option.)</label>
                <select
                  value={s.intensity ?? ""}
                  onChange={(e) => update(i, { intensity: e.target.value || null })}
                  disabled={intensities.length === 0}
                >
                  <option value="">— généraliste —</option>
                  {intensities.map((it) => (
                    <option key={it} value={it}>{it}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 sm:col-span-1 flex justify-end">
                <button type="button" className="btn-ghost" onClick={() => remove(i)} aria-label="Supprimer">
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <button type="button" className="btn-ghost self-start" onClick={add}>
        + Ajouter une séance
      </button>
    </div>
  );
}
