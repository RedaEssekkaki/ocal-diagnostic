import { useState } from "react";
import type { ProfileIn } from "../types";
import { SessionsField } from "./SessionsField";
import { Stepper } from "./Stepper";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";

interface Props {
  initial: ProfileIn;
  onSubmit: (p: ProfileIn) => void;
  loading: boolean;
}

const STEPS = ["Profil", "Activités quotidienne", "Séances", "Préférences repas"];

const OBJECTIVES = [
  { value: "maintien", label: "Maintien" },
  { value: "perte", label: "Perte de poids" },
  { value: "seche", label: "Sèche" },
  { value: "prise_muscle", label: "Prise de muscle" },
  { value: "recomposition", label: "Recomposition" },
];
const PACES = [
  { value: "", label: "Recommandé" },
  { value: "doux", label: "Doux" },
  { value: "modere", label: "Modéré" },
  { value: "rapide", label: "Rapide" },
];
const DIETS = [
  { value: "omnivore", label: "Omnivore" },
  { value: "vegetarien", label: "Végétarien" },
  { value: "vegan", label: "Vegan" },
];
const ACTIVITY_LEVELS = [
  { value: "sedentaire", label: "Sédentaire" },
  { value: "leger", label: "Léger" },
  { value: "actif", label: "Actif" },
  { value: "tres_actif", label: "Très actif" },
];
const BREAKFASTS = [
  { value: "complet", label: "Complet" },
  { value: "leger", label: "Léger" },
  { value: "aucun", label: "Aucun (3 repas)" },
];
const MAIN_MEALS = [
  { value: "equilibre", label: "Équilibré" },
  { value: "midi", label: "Midi" },
  { value: "soir", label: "Soir" },
];

export function ProfileForm({ initial, onSubmit, loading }: Props) {
  const [p, setP] = useState<ProfileIn>(initial);
  const [weightText, setWeightText] = useState(() => String(initial.weight_kg));
  const [step, setStep] = useState(0);

  const set = <K extends keyof ProfileIn>(key: K, v: ProfileIn[K]) =>
    setP((prev) => ({ ...prev, [key]: v }));

  const isLast = step === STEPS.length - 1;

  const profileValid =
    p.birthday.trim() !== "" && weightText.trim() !== "" && p.height_cm > 0;

  const next = () => {
    if (step === 0 && !profileValid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    if (weightText.trim() === "") return;
    onSubmit({ ...p, weight_kg: Number(weightText) });
  };

  return (
    <div>
      <h1 className="text-center font-title text-2xl uppercase tracking-wide text-label-default sm:text-3xl">
        Calculer vos besoins nutritionnels
      </h1>
      <Stepper count={STEPS.length} current={step} />

      <section className="card !p-6 sm:!p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-title text-3xl leading-none text-surface-variant">
            {String(step + 1).padStart(2, "0")}
          </span>
          <h2 className="font-title text-lg uppercase tracking-wide text-label-default">
            {STEPS[step]}
          </h2>
        </div>

        {/* Étape 1 : Profil */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted">Genre</span>
              <div className="flex gap-2">
                {([
                  ["M", "Homme"],
                  ["F", "Femme"],
                ] as const).map(([val, lbl]) => (
                  <Chip
                    key={val}
                    selected={p.sex === val}
                    onClick={() => set("sex", val)}
                    className="flex-1"
                  >
                    {lbl}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TextField
                type="date"
                label="Date de naissance"
                value={p.birthday}
                onChange={(e) => set("birthday", e.target.value)}
                required
              />
              <TextField
                type="number"
                label="Poids (kg)"
                step="0.1"
                min={30}
                max={300}
                value={weightText}
                onChange={(e) => {
                  setWeightText(e.target.value);
                  if (e.target.value !== "") set("weight_kg", Number(e.target.value));
                }}
                required
              />
              <TextField
                type="number"
                label="Taille (cm)"
                min={120}
                max={230}
                value={p.height_cm}
                onChange={(e) => set("height_cm", Number(e.target.value))}
                required
              />
              <Select
                label="Objectif"
                value={p.objective}
                onValueChange={(v) => set("objective", v as ProfileIn["objective"])}
                options={OBJECTIVES}
              />
              <Select
                label="Rythme"
                value={p.pace ?? ""}
                onValueChange={(v) => set("pace", (v || null) as ProfileIn["pace"])}
                options={PACES}
              />
              <TextField
                type="number"
                label="Masse grasse (%)"
                step="0.1"
                min={3}
                max={60}
                placeholder="optionnel"
                value={p.bodyfat_pct ?? ""}
                onChange={(e) =>
                  set("bodyfat_pct", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
          </div>
        )}

        {/* Étape 2 : Activités quotidienne */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select
              label="Niveau d'activité"
              value={p.activity_level}
              onValueChange={(v) => set("activity_level", v as ProfileIn["activity_level"])}
              options={ACTIVITY_LEVELS}
              supportingText="Ignoré si nb de pas renseigné"
            />
            <TextField
              type="number"
              label="Pas / jour"
              min={0}
              max={60000}
              placeholder="optionnel"
              value={p.steps ?? ""}
              onChange={(e) => set("steps", e.target.value === "" ? null : Number(e.target.value))}
            />
            <div className="sm:col-span-2">
              <Checkbox
                label="Profil athlète"
                checked={p.is_athlete}
                onChange={(e) => set("is_athlete", e.target.checked)}
              />
            </div>
          </div>
        )}

        {/* Étape 3 : Séances */}
        {step === 2 && (
          <SessionsField sessions={p.sessions} onChange={(s) => set("sessions", s)} />
        )}

        {/* Étape 4 : Préférences repas */}
        {step === 3 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Select
              label="Petit déjeuner"
              value={p.breakfast}
              onValueChange={(v) => set("breakfast", v as ProfileIn["breakfast"])}
              options={BREAKFASTS}
            />
            <Select
              label="Repas principal"
              value={p.main_meal}
              onValueChange={(v) => set("main_meal", v as ProfileIn["main_meal"])}
              options={MAIN_MEALS}
            />
            <Select
              label="Régime"
              value={p.diet}
              onValueChange={(v) => set("diet", v as ProfileIn["diet"])}
              options={DIETS}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
          {step > 0 ? (
            <Button
              variant="text"
              onClick={back}
              leftIcon={<Icon name="arrow_back" size={20} />}
            >
              Retour
            </Button>
          ) : (
            <span />
          )}

          {isLast ? (
            <Button
              onClick={submit}
              loading={loading}
              rightIcon={<Icon name="restart_alt" size={20} />}
            >
              Calculer mes besoins
            </Button>
          ) : (
            <Button
              onClick={next}
              disabled={step === 0 && !profileValid}
              rightIcon={<Icon name="arrow_forward" size={20} />}
            >
              Continuer
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
