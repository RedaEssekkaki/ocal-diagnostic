import { useState } from "react";
import type { ProfileIn } from "../types";
import { SessionsField } from "./SessionsField";

interface Props {
  initial: ProfileIn;
  onSubmit: (p: ProfileIn) => void;
  loading: boolean;
}

export function ProfileForm({ initial, onSubmit, loading }: Props) {
  const [p, setP] = useState<ProfileIn>(initial);

  const set = <K extends keyof ProfileIn>(key: K, v: ProfileIn[K]) =>
    setP((prev) => ({ ...prev, [key]: v }));

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(p);
  };

  return (
    <form onSubmit={handle} className="flex flex-col gap-6">
      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Profil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="field">
            <label>Sexe</label>
            <select value={p.sex} onChange={(e) => set("sex", e.target.value as ProfileIn["sex"])}>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>
          <div className="field">
            <label>Âge</label>
            <input type="number" min={14} max={100} value={p.age} onChange={(e) => set("age", Number(e.target.value))} required />
          </div>
          <div className="field">
            <label>Poids (kg)</label>
            <input type="number" step="0.1" min={30} max={300} value={p.weight_kg} onChange={(e) => set("weight_kg", Number(e.target.value))} required />
          </div>
          <div className="field">
            <label>Taille (cm)</label>
            <input type="number" min={120} max={230} value={p.height_cm} onChange={(e) => set("height_cm", Number(e.target.value))} required />
          </div>
          <div className="field">
            <label>Objectif</label>
            <select value={p.objective} onChange={(e) => set("objective", e.target.value as ProfileIn["objective"])}>
              <option value="maintien">Maintien</option>
              <option value="perte">Perte de poids</option>
              <option value="seche">Sèche</option>
              <option value="prise_muscle">Prise de muscle</option>
              <option value="recomposition">Recomposition</option>
            </select>
          </div>
          <div className="field">
            <label>Rythme</label>
            <select value={p.pace ?? ""} onChange={(e) => set("pace", (e.target.value || null) as ProfileIn["pace"])}>
              <option value="">— recommandé —</option>
              <option value="doux">Doux</option>
              <option value="modere">Modéré</option>
              <option value="rapide">Rapide</option>
            </select>
          </div>
          <div className="field">
            <label>Régime</label>
            <select value={p.diet} onChange={(e) => set("diet", e.target.value as ProfileIn["diet"])}>
              <option value="omnivore">Omnivore</option>
              <option value="vegetarien">Végétarien</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
          <div className="field">
            <label>Masse grasse (%)</label>
            <input type="number" step="0.1" min={3} max={60} placeholder="optionnel" value={p.bodyfat_pct ?? ""} onChange={(e) => set("bodyfat_pct", e.target.value === "" ? null : Number(e.target.value))} />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Activité quotidienne</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="field">
            <label>Niveau d'activité</label>
            <select value={p.activity_level} onChange={(e) => set("activity_level", e.target.value as ProfileIn["activity_level"])}>
              <option value="sedentaire">Sédentaire</option>
              <option value="leger">Léger</option>
              <option value="actif">Actif</option>
              <option value="tres_actif">Très actif</option>
            </select>
            <span className="text-xs text-slate-500">Ignoré si nb de pas renseigné</span>
          </div>
          <div className="field">
            <label>Pas / jour</label>
            <input type="number" min={0} max={60000} placeholder="optionnel" value={p.steps ?? ""} onChange={(e) => set("steps", e.target.value === "" ? null : Number(e.target.value))} />
          </div>
          <div className="field justify-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={p.is_athlete} onChange={(e) => set("is_athlete", e.target.checked)} className="rounded border-slate-300" />
              <span>Profil athlète</span>
            </label>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Séances</h2>
        <SessionsField sessions={p.sessions} onChange={(s) => set("sessions", s)} />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Préférences repas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <label>Petit déjeuner</label>
            <select value={p.breakfast} onChange={(e) => set("breakfast", e.target.value as ProfileIn["breakfast"])}>
              <option value="complet">Complet</option>
              <option value="leger">Léger</option>
              <option value="aucun">Aucun (3 repas)</option>
            </select>
          </div>
          <div className="field">
            <label>Repas principal</label>
            <select value={p.main_meal} onChange={(e) => set("main_meal", e.target.value as ProfileIn["main_meal"])}>
              <option value="equilibre">Équilibré</option>
              <option value="midi">Midi</option>
              <option value="soir">Soir</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Calcul…" : "Calculer mes cibles"}
        </button>
      </div>
    </form>
  );
}
