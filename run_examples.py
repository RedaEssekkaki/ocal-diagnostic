# -*- coding: utf-8 -*-
"""Harnais de test : rejoue Léa / Yanis / Karim de bout en bout."""
from nutrition_engine.engine import (
    Session, Profile, compute_targets, split_into_meals, assign_components,
)
from nutrition_engine.viz import save_macro_chart

PROFILES = {
    "Léa": Profile(
        sex="F", age=35, weight_kg=72, height_cm=167,
        objective="perte", activity_level="sedentaire", pace="doux",
        sessions=[Session("Musculation", minutes=45, per_week=2)],  # généraliste
    ),
    "Yanis": Profile(
        sex="M", age=26, weight_kg=75, height_cm=177,
        objective="prise_muscle", steps=9000, pace="doux", bodyfat_pct=12,
        sessions=[Session("Musculation", minutes=75, per_week=4, intensity="elevee")],
    ),
    "Karim": Profile(
        sex="M", age=23, weight_kg=74, height_cm=175,
        objective="seche", activity_level="leger", pace="rapide", is_athlete=True,
        sessions=[Session("Boxe", minutes=90, per_week=6, intensity="sparring")],
    ),
}

BREAKFAST = {"Léa": "complet", "Yanis": "complet", "Karim": "complet"}
MAIN_MEAL = {"Léa": "equilibre", "Yanis": "equilibre", "Karim": "equilibre"}

def show(name, p):
    t = compute_targets(p)
    print(f"\n{'='*64}\n{name}  ({p.sex}, {p.age} ans, {p.weight_kg} kg, {p.height_cm} cm — {p.objective})")
    print(f"{'-'*64}")
    print(f"  BMR        : {t.bmr:>5} kcal   [{t.bmr_method}]")
    print(f"  NEAT       : {t.neat_kcal:>5} kcal")
    print(f"  Sport      : {t.sport_kcal:>5} kcal/j")
    print(f"  TDEE       : {t.tdee:>5} kcal")
    print(f"  Cible      : {t.calories:>5} kcal/j   (rythme {t.pace}, {t.weekly_change_kg:+.3f} kg/sem)")
    print(f"  Macros     : P {t.protein_g} g | G {t.carb_g} g | L {t.fat_g} g | fibres {t.fiber_g} g")
    print(f"  Confiance  : {t.confidence}/100")
    if t.warnings:
        for w in t.warnings:
            print(f"  ⚠  {w}")
    # Répartition repas
    meals = split_into_meals(t, breakfast=BREAKFAST[name], main_meal=MAIN_MEAL[name])
    print(f"  Répartition (petit déj / midi / collation / soir) :")
    for m, v in meals.items():
        print(f"     {m:<11}: {v['kcal']:>4} kcal | P{v['protein_g']:>3} C{v['carb_g']:>3} F{v['fat_g']:>3}")
    # Exemple d'assemblage du repas du midi
    if "midi" in meals:
        comp = assign_components(meals["midi"])
        print(f"  Assemblage du MIDI (poulet/riz/légumes/sauce) :")
        print(f"     poulet {comp['poulet_g']} g · riz {comp['riz_g']} g · "
              f"légumes {comp['legumes_g']} g · sauce {comp['sauce_g']} g"
              + (f" · +{comp['oeuf_topper']} œufs" if comp['oeuf_topper'] else ""))
    # Visuel : donut des macros (fichier HTML ouvrable dans un navigateur)
    chart = save_macro_chart(t, f"macros_{name}.html", title=f"Répartition des macros — {name}")
    print(f"  📊 Graphique généré : {chart}")

if __name__ == "__main__":
    for name, p in PROFILES.items():
        show(name, p)
    print(f"\n{'='*64}\nCalories cibles attendues : Léa ~1640 · Yanis ~3550 · Karim ~2750")
