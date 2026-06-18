import type { SessionIn } from "../types";
import { SPORTS_BY_CATEGORY, INTENSITIES_BY_SPORT } from "../sports";
import { TextField } from "@/components/ui/text-field";
import { Select, type SelectGroup } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

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

const SPORT_GROUPS: SelectGroup[] = Object.entries(SPORTS_BY_CATEGORY).map(
  ([cat, sports]) => ({
    label: cat,
    options: sports.map((s) => ({ value: s, label: s })),
  }),
);

export function SessionsField({ sessions, onChange }: Props) {
  const update = (i: number, patch: Partial<SessionIn>) =>
    onChange(sessions.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const add = () => onChange([...sessions, { ...emptySession }]);
  const duplicate = (i: number) =>
    onChange([...sessions.slice(0, i + 1), { ...sessions[i] }, ...sessions.slice(i + 1)]);
  const remove = (i: number) => onChange(sessions.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {sessions.length === 0 && (
        <p className="text-sm italic text-muted">
          Aucune séance : le moteur calculera sur la base de l'activité quotidienne uniquement.
        </p>
      )}

      {sessions.map((s, i) => {
        const intensities = INTENSITIES_BY_SPORT[s.sport] ?? [];
        const intensityOptions = [
          { value: "", label: "Généraliste" },
          ...intensities.map((it) => ({ value: it, label: it })),
        ];
        return (
          <div key={i} className="rounded-md border border-line bg-tonal-bg p-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 sm:col-span-4">
                <Select
                  label="Sport"
                  value={s.sport}
                  onValueChange={(v) => update(i, { sport: v, intensity: null })}
                  groups={SPORT_GROUPS}
                />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <TextField
                  type="number"
                  label="Durée (min)"
                  min={1}
                  max={600}
                  value={s.minutes}
                  onChange={(e) => update(i, { minutes: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <TextField
                  type="number"
                  label="/ semaine"
                  min={1}
                  max={21}
                  value={s.per_week}
                  onChange={(e) => update(i, { per_week: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-8 sm:col-span-3">
                <Select
                  label="Intensité"
                  value={s.intensity ?? ""}
                  onValueChange={(v) => update(i, { intensity: v || null })}
                  options={intensityOptions}
                  disabled={intensities.length === 0}
                />
              </div>
              <div className="col-span-4 flex items-center justify-end gap-1 sm:col-span-1">
                <button
                  type="button"
                  onClick={() => duplicate(i)}
                  aria-label="Dupliquer la séance"
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-dark-green/[0.06]"
                >
                  <Icon name="content_copy" size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Supprimer la séance"
                  className="grid size-10 place-items-center rounded-full text-error transition-colors hover:bg-error/[0.08]"
                >
                  <Icon name="delete" size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <Button
        variant="text"
        onClick={add}
        leftIcon={<Icon name="add" size={20} />}
        className="self-start"
      >
        Ajouter une séance
      </Button>
    </div>
  );
}
