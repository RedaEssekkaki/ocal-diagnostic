# -*- coding: utf-8 -*-
"""FastAPI app exposée comme serverless function Vercel.
Endpoint unique : POST /api/targets.
"""
from __future__ import annotations
from typing import Literal, Optional
from dataclasses import asdict
from datetime import date

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nutrition_engine.engine import (
    Session, Profile, compute_targets, split_into_meals,
)


# ===========================================================================
# Schémas Pydantic (entrée + sortie)
# ===========================================================================
Sex = Literal["M", "F"]
Objective = Literal["maintien", "perte", "seche", "prise_muscle", "recomposition"]
ActivityLevel = Literal["sedentaire", "leger", "actif", "tres_actif"]
Pace = Literal["doux", "modere", "rapide"]
Diet = Literal["omnivore", "vegetarien", "vegan"]
Breakfast = Literal["complet", "leger", "aucun"]
MainMeal = Literal["midi", "soir", "equilibre"]


class SessionIn(BaseModel):
    sport: str = Field(..., min_length=1)
    minutes: float = Field(..., gt=0, le=600)
    per_week: int = Field(..., ge=1, le=21)
    intensity: Optional[str] = None


class ProfileIn(BaseModel):
    sex: Sex
    birthday: str = Field(..., description="Date de naissance ISO (YYYY-MM-DD)")
    weight_kg: float = Field(..., ge=30, le=300)
    height_cm: float = Field(..., ge=120, le=230)
    objective: Objective
    sessions: list[SessionIn] = Field(default_factory=list)
    activity_level: ActivityLevel = "sedentaire"
    steps: Optional[int] = Field(default=None, ge=0, le=60000)
    pace: Optional[Pace] = None
    bodyfat_pct: Optional[float] = Field(default=None, ge=3, le=60)
    diet: Diet = "omnivore"
    is_athlete: bool = False
    breakfast: Breakfast = "complet"
    main_meal: MainMeal = "equilibre"


class TargetsOut(BaseModel):
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
    warnings: list[str]
    infos: list[str]


class MealOut(BaseModel):
    protein_g: float
    carb_g: float
    fat_g: float
    kcal: float


class ApiResponse(BaseModel):
    targets: TargetsOut
    meals: dict[str, MealOut]


# ===========================================================================
# App FastAPI
# ===========================================================================
app = FastAPI(
    title="Nutrition Engine API",
    description="Calcul de cibles nutritionnelles sportives (BMR → TDEE → macros → repas).",
    version="1.0.0",
)

# En prod sur Vercel, front et back sont sur la même origine → CORS pas strictement nécessaire.
# On garde une politique permissive pour le dev local (front 5173, back 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/api")
@app.get("/api/index")
@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


@app.post("/", response_model=ApiResponse)
@app.post("/api/index", response_model=ApiResponse)
@app.post("/api/targets", response_model=ApiResponse)
def targets(payload: ProfileIn) -> dict:
    data = payload.model_dump()
    breakfast = data.pop("breakfast")
    main_meal = data.pop("main_meal")
    sessions = [Session(**s) for s in data.pop("sessions")]
    bday = date.fromisoformat(data.pop("birthday"))
    today = date.today()
    age = today.year - bday.year - ((today.month, today.day) < (bday.month, bday.day))
    profile = Profile(sessions=sessions, age=age, **data)

    t = compute_targets(profile)
    meals = split_into_meals(t, breakfast=breakfast, main_meal=main_meal)

    return {"targets": asdict(t), "meals": meals}
