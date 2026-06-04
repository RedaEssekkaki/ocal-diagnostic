# -*- coding: utf-8 -*-
"""
Moteur de calcul nutritionnel sportif — logique métier PURE (aucune dépendance Django).
À déposer dans une app Django (ex. apps/nutrition/engine.py) et à appeler depuis les
vues/serializers DRF, que le front React consomme via l'API.

Cascade : BMR -> TDEE (BMR + NEAT + sport) -> calories cibles -> macros (P -> G -> L)
-> fibres -> garde-fous -> répartition en repas -> assemblage composants (buckets).

Chaque constante est justifiée dans le dossier scientifique (références + niveau de preuve).
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Optional
import csv
import os

# ===========================================================================
# 1. CONSTANTES (verrouillées — voir dossier de justification scientifique)
# ===========================================================================

# --- NEAT : facteurs d'activité (PAL, FAO/WHO/UNU 2004 ; IOM 2005) ---
NEAT_FACTORS = {"sedentaire": 1.40, "leger": 1.50, "actif": 1.60, "tres_actif": 1.75}

def neat_factor_from_steps(steps: int) -> float:
    """Les pas REMPLACENT le niveau déclaré (pas de double comptage)."""
    if steps < 5000:
        return 1.40
    if steps < 7500:
        return 1.50
    if steps < 10000:
        return 1.60
    return 1.75

# --- Équivalent énergétique (Wishnofsky 1958 ; approx., recalibré par le poids réel) ---
KCAL_PER_KG = 7700.0

# --- Vitesses de variation (fraction du poids / semaine) ---
PACE_RATES = {
    "perte":         {"doux": 0.005, "modere": 0.0075, "rapide": 0.010},
    "seche":         {"doux": 0.005, "modere": 0.0075, "rapide": 0.010},
    "prise_muscle":  {"doux": 0.0025, "modere": 0.004},
    "recomposition": {"doux": 0.0035, "modere": 0.005},
    "maintien":      {"doux": 0.0, "modere": 0.0, "rapide": 0.0},
}
LOSS_CAP = 0.010   # plafond 1 %/sem (Garthe 2011 ; Helms 2014)
GAIN_CAP = 0.005

# Sens du delta calorique selon l'objectif (+1 surplus / -1 déficit / 0)
OBJECTIVE_SIGN = {
    "maintien": 0, "perte": -1, "seche": -1,
    "prise_muscle": +1, "recomposition": -1,
}

# --- Protéines (g/kg de poids ; sèche peut utiliser la masse maigre) ---
PROTEIN_G_PER_KG = {
    "maintien": 1.4, "perte": 1.6, "seche": 2.6,
    "prise_muscle": 2.0, "recomposition": 2.2,
}
VEGAN_PROTEIN_FACTOR = 1.15          # +15 % (qualité protéique)
SENIOR_PROTEIN_FLOOR = 1.2           # >= 65 ans (PROT-AGE 2013)

# --- Lipides : plancher hormonal (>=0,8 g/kg ou >=20 % des kcal) ---
FAT_FLOOR_G_PER_KG = 0.8
FAT_FLOOR_PCT_KCAL = 0.20

# --- Sports de résistance (obligatoires pour prise de muscle / recomposition) ---
RESISTANCE_SPORTS = {
    "Musculation", "Calisthénie", "CrossFit/HIIT/circuit training", "Haltérophilie",
}

# --- Énergie disponible (RED-S) : seuil d'alerte ---
EA_THRESHOLD = 30.0  # kcal/kg de masse maigre/jour (Loucks 2011 ; IOC 2023)

# --- Répartition en 4 repas (protéine répartie ; énergie pondérée) ---
# Chaque dict somme à 1.0 sur les repas concernés.
MEAL_TEMPLATES = {
    "complet": {  # petit déj + midi + collation + soir
        "protein": {"petit_dej": 0.25, "midi": 0.25, "collation": 0.25, "soir": 0.25},
        "energy":  {"petit_dej": 0.30, "midi": 0.30, "collation": 0.10, "soir": 0.30},
    },
    "leger": {    # petit déj allégé
        "protein": {"petit_dej": 0.15, "midi": 0.30, "collation": 0.20, "soir": 0.35},
        "energy":  {"petit_dej": 0.10, "midi": 0.35, "collation": 0.15, "soir": 0.40},
    },
    "aucun": {    # pas de petit déj (3 repas)
        "protein": {"midi": 0.35, "collation": 0.25, "soir": 0.40},
        "energy":  {"midi": 0.40, "collation": 0.15, "soir": 0.45},
    },
}

# Densités des composants (par 100 g, cuit/prêt à consommer) — pour les buckets
COMPONENTS = {
    "poulet":  {"P": 31.0, "C": 0.0,  "F": 4.0,  "fiber": 0.0},
    "riz":     {"P": 2.7,  "C": 28.0, "F": 0.3,  "fiber": 0.4},
    "legumes": {"P": 2.0,  "C": 5.0,  "F": 0.5,  "fiber": 3.0},
    "sauce":   {"P": 0.0,  "C": 2.0,  "F": 90.0, "fiber": 0.0},  # base huile, dosable
    "oeuf":    {"P": 12.6, "C": 1.1,  "F": 10.6, "fiber": 0.0},  # topper protéiné
}
KCAL = {"P": 4.0, "C": 4.0, "F": 9.0}


# ===========================================================================
# 2. STRUCTURES DE DONNÉES
# ===========================================================================
@dataclass
class Session:
    sport: str
    minutes: float
    per_week: int
    intensity: Optional[str] = None  # None -> mode généraliste ; sinon mode poussé

@dataclass
class Profile:
    sex: str                 # 'M' / 'F'
    age: int
    weight_kg: float
    height_cm: float
    objective: str           # maintien | perte | seche | prise_muscle | recomposition
    sessions: list[Session] = field(default_factory=list)
    activity_level: str = "sedentaire"
    steps: Optional[int] = None
    pace: Optional[str] = None        # doux | modere | rapide ; None -> recommandé
    bodyfat_pct: Optional[float] = None
    diet: str = "omnivore"            # omnivore | vegetarien | vegan
    is_athlete: bool = False

@dataclass
class Targets:
    bmr: float
    bmr_method: str
    neat_kcal: float
    sport_kcal: float
    tdee: float
    calories: float
    pace: str
    weekly_change_kg: float
    protein_g: float
    carb_g: float
    fat_g: float
    fiber_g: float
    confidence: int
    warnings: list[str] = field(default_factory=list)


# ===========================================================================
# 3. CHARGEMENT DE LA TABLE MET
# ===========================================================================
_MET_PATH = os.path.join(os.path.dirname(__file__), "met_table.csv")

def load_met_table(path: str = _MET_PATH) -> dict:
    """Retourne {('generaliste', sport): met, ('pousse', sport, intensite): met}."""
    table = {}
    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            met = float(row["met"])
            if row["mode"] == "generaliste":
                table[("generaliste", row["sport"])] = met
            else:
                table[("pousse", row["sport"], row["intensite"])] = met
    return table

_MET_TABLE = load_met_table()

def met_for(session: Session, table: dict = _MET_TABLE) -> float:
    """Mode poussé si intensité fournie ; sinon généraliste. Fallback -> généraliste."""
    if session.intensity:
        key = ("pousse", session.sport, session.intensity)
        if key in table:
            return table[key]
    gen = table.get(("generaliste", session.sport))
    if gen is not None:
        return gen
    raise KeyError(f"Sport inconnu dans la table MET : {session.sport!r}")


# ===========================================================================
# 4. ÉTAGE 1 — BMR
# ===========================================================================
def bmr_mifflin(p: Profile) -> float:
    base = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age
    return base + (5 if p.sex.upper() == "M" else -161)

def bmr_cunningham(p: Profile) -> float:
    ffm = p.weight_kg * (1 - p.bodyfat_pct / 100.0)
    return 500 + 22 * ffm

def bmr_ten_haaf(p: Profile) -> float:
    sex = 1 if p.sex.upper() == "M" else 0
    return (11.936 * p.weight_kg + 587.728 * (p.height_cm / 100.0)
            - 8.129 * p.age + 191.027 * sex + 29.279)

def select_bmr(p: Profile) -> tuple[float, str]:
    """Cunningham si %MG connu ; sinon Ten-Haaf si athlète ; sinon Mifflin."""
    if p.bodyfat_pct is not None:
        return bmr_cunningham(p), "Cunningham (masse maigre)"
    if p.is_athlete or len(p.sessions) >= 4:
        return bmr_ten_haaf(p), "Ten-Haaf (athlète)"
    return bmr_mifflin(p), "Mifflin-St Jeor"


# ===========================================================================
# 5. ÉTAGE 2 — NEAT + SPORT -> TDEE
# ===========================================================================
def neat_kcal(p: Profile, bmr: float) -> float:
    factor = neat_factor_from_steps(p.steps) if p.steps is not None \
        else NEAT_FACTORS[p.activity_level]
    return bmr * (factor - 1)

def sport_kcal_per_day(p: Profile) -> float:
    """[ Σ séances (MET-1) × poids × durée(h) ] / 7. Le -1 retire le repos (BMR)."""
    weekly = 0.0
    for s in p.sessions:
        met = met_for(s)
        weekly += (met - 1) * p.weight_kg * (s.minutes / 60.0) * s.per_week
    return weekly / 7.0


# ===========================================================================
# 6. ÉTAGE 3 — CALORIES CIBLES
# ===========================================================================
def recommend_pace(p: Profile) -> str:
    """Reco prudente : prise -> doux ; sèche/lean -> doux ; perte -> modéré."""
    if p.objective in ("prise_muscle", "recomposition", "seche"):
        return "doux"
    if p.objective == "maintien":
        return "modere"
    return "modere"

def target_calories(p: Profile, tdee: float) -> tuple[float, str, float]:
    pace = p.pace or recommend_pace(p)
    rates = PACE_RATES[p.objective]
    rate = rates.get(pace, list(rates.values())[0])
    cap = LOSS_CAP if OBJECTIVE_SIGN[p.objective] < 0 else GAIN_CAP
    rate = min(rate, cap)                       # plafond de sécurité
    weekly_change = OBJECTIVE_SIGN[p.objective] * rate * p.weight_kg
    delta = weekly_change * KCAL_PER_KG / 7.0   # kcal/jour
    return tdee + delta, pace, weekly_change


# ===========================================================================
# 7. ÉTAGE 4 — MACROS
# ===========================================================================
def protein_g(p: Profile) -> float:
    coeff = PROTEIN_G_PER_KG[p.objective]
    if p.diet == "vegan":
        coeff *= VEGAN_PROTEIN_FACTOR
    if p.age >= 65:
        coeff = max(coeff, SENIOR_PROTEIN_FLOOR)
    # En sèche, on peut ancrer sur la masse maigre si %MG connu (2,3-3,1 g/kg MM)
    if p.objective == "seche" and p.bodyfat_pct is not None:
        ffm = p.weight_kg * (1 - p.bodyfat_pct / 100.0)
        return min(coeff * p.weight_kg, 3.1 * ffm)
    return coeff * p.weight_kg

def carb_g_per_kg(p: Profile) -> float:
    """Selon le volume d'entraînement hebdomadaire (heures de sport/sem)."""
    hours = sum(s.minutes / 60.0 * s.per_week for s in p.sessions)
    if hours < 2:    base = 3.0
    elif hours < 4:  base = 4.5
    elif hours < 6:  base = 6.0
    elif hours < 9:  base = 7.0
    else:            base = 8.0
    if p.objective == "prise_muscle":
        base += 0.5
    return base

def split_macros(p: Profile, calories: float) -> tuple[float, float, float]:
    """Protéines (g/kg) -> glucides (g/kg) -> lipides = solde, avec plancher.
    Si le plancher lipidique mord, les glucides deviennent le solde."""
    P = protein_g(p)
    p_kcal = P * KCAL["P"]
    fat_floor_g = max(FAT_FLOOR_G_PER_KG * p.weight_kg, FAT_FLOOR_PCT_KCAL * calories / KCAL["F"])
    fat_floor_kcal = fat_floor_g * KCAL["F"]

    carb_target_g = carb_g_per_kg(p) * p.weight_kg
    carb_target_kcal = carb_target_g * KCAL["C"]

    if carb_target_kcal + fat_floor_kcal <= calories - p_kcal:
        # Assez de place : glucides = cible, lipides = solde (>= plancher)
        C = carb_target_g
        F = (calories - p_kcal - carb_target_kcal) / KCAL["F"]
    else:
        # Plancher lipidique prioritaire -> glucides = solde
        F = fat_floor_g
        C = (calories - p_kcal - fat_floor_kcal) / KCAL["C"]
    return round(P), round(max(C, 0)), round(F)

def fiber_g(calories: float) -> int:
    return int(min(round(max(30.0, 14.0 * calories / 1000.0)), 40))


# ===========================================================================
# 8. ÉTAGE 5 — GARDE-FOUS + CONFIANCE
# ===========================================================================
def guardrails(p: Profile, calories: float, sport_kcal: float, weekly_change: float) -> list[str]:
    w = []
    # 1) RED-S : énergie disponible (si masse maigre connue)
    if p.bodyfat_pct is not None:
        ffm = p.weight_kg * (1 - p.bodyfat_pct / 100.0)
        ea = (calories - sport_kcal) / ffm
        if ea < EA_THRESHOLD:
            w.append(f"Énergie disponible {ea:.0f} kcal/kg MM < {EA_THRESHOLD:.0f} : risque RED-S, remonter les calories.")
    # 2) Résistance obligatoire pour construire du muscle
    if p.objective in ("prise_muscle", "recomposition"):
        if not any(s.sport in RESISTANCE_SPORTS for s in p.sessions):
            w.append("Objectif muscle sans entraînement de résistance : risque de prise de gras. Ajouter de la résistance.")
    # 3) Rythme plafonné (information)
    if abs(weekly_change) >= LOSS_CAP * p.weight_kg - 1e-6 and OBJECTIVE_SIGN[p.objective] < 0:
        w.append("Rythme plafonné à 1 %/semaine (sécurité, préservation du muscle).")
    return w

def confidence_score(p: Profile) -> int:
    score = 60
    if p.bodyfat_pct is not None:
        score += 15
    if p.steps is not None:
        score += 10
    if any(s.intensity for s in p.sessions):
        score += 10
    return min(score, 100)


# ===========================================================================
# 9. PIPELINE COMPLET
# ===========================================================================
def compute_targets(p: Profile) -> Targets:
    bmr, method = select_bmr(p)
    neat = neat_kcal(p, bmr)
    sport = sport_kcal_per_day(p)
    tdee = bmr + neat + sport
    calories, pace, weekly_change = target_calories(p, tdee)
    P, C, F = split_macros(p, calories)
    return Targets(
        bmr=round(bmr), bmr_method=method, neat_kcal=round(neat), sport_kcal=round(sport),
        tdee=round(tdee), calories=round(calories), pace=pace,
        weekly_change_kg=round(weekly_change, 3),
        protein_g=P, carb_g=C, fat_g=F, fiber_g=fiber_g(calories),
        confidence=confidence_score(p),
        warnings=guardrails(p, calories, sport, weekly_change),
    )


# ===========================================================================
# 10. RÉPARTITION EN REPAS
# ===========================================================================
def split_into_meals(t: Targets, breakfast: str = "complet", main_meal: str = "equilibre") -> dict:
    """Découpe les cibles journalières en repas. Protéine répartie également,
    énergie (glucides + lipides) pondérée. main_meal : midi | soir | equilibre."""
    tpl = MEAL_TEMPLATES[breakfast]
    energy = {m: v for m, v in tpl["energy"].items()}
    # Pondération repas principal (déplace l'énergie midi<->soir, protéine inchangée)
    if main_meal == "midi" and "midi" in energy and "soir" in energy:
        shift = min(0.10, energy["soir"])
        energy["midi"] += shift; energy["soir"] -= shift
    elif main_meal == "soir" and "midi" in energy and "soir" in energy:
        shift = min(0.10, energy["midi"])
        energy["soir"] += shift; energy["midi"] -= shift

    meals = {}
    for m in tpl["protein"]:
        P = t.protein_g * tpl["protein"][m]
        C = t.carb_g * energy[m]
        F = t.fat_g * energy[m]
        meals[m] = {
            "protein_g": round(P), "carb_g": round(C), "fat_g": round(F),
            "kcal": round(P * 4 + C * 4 + F * 9),
        }
    return meals


# ===========================================================================
# 11. ASSEMBLAGE COMPOSANTS (buckets) — portionnage au gramme, protéine prioritaire
# ===========================================================================
def assign_components(meal: dict, veg_g: float = 150.0) -> dict:
    """Pour un repas (P/C/F), calcule les grammes de poulet/riz/légumes/sauce.
    Légumes fixés ; on résout glucides -> protéine -> lipides ; topper si protéine manque."""
    P, C, F = meal["protein_g"], meal["carb_g"], meal["fat_g"]
    veg = COMPONENTS["legumes"]
    # Riz pour atteindre les glucides (légumes en apportent un peu)
    rice = max(0.0, (C - veg["C"] / 100 * veg_g) / (COMPONENTS["riz"]["C"] / 100))
    # Poulet pour la protéine restante
    prot_from_sides = COMPONENTS["riz"]["P"] / 100 * rice + veg["P"] / 100 * veg_g
    chicken = (P - prot_from_sides) / (COMPONENTS["poulet"]["P"] / 100)
    topper_eggs = 0
    if chicken < 0:  # protéine déjà couverte par les sides
        chicken = 0.0
    # Si protéine très haute et poulet seul insuffisant à cause des lipides, on garde simple ici
    # Sauce pour les lipides restants
    fat_from_others = (COMPONENTS["poulet"]["F"] / 100 * chicken
                       + COMPONENTS["riz"]["F"] / 100 * rice
                       + veg["F"] / 100 * veg_g)
    sauce = max(0.0, (F - fat_from_others) / (COMPONENTS["sauce"]["F"] / 100))
    # Vérif protéine : si le poulet ne suffit pas (cap réaliste ~250 g), ajouter des œufs
    if chicken > 250:
        excess_P = (chicken - 250) * COMPONENTS["poulet"]["P"] / 100
        chicken = 250.0
        topper_eggs = round(excess_P / (COMPONENTS["oeuf"]["P"] / 100 * 50))  # œufs de 50 g
    return {
        "poulet_g": round(chicken), "riz_g": round(rice),
        "legumes_g": round(veg_g), "sauce_g": round(sauce),
        "oeuf_topper": topper_eggs,
    }
