# -*- coding: utf-8 -*-
"""
Exemple d'intégration Django REST Framework (illustratif).
Le moteur (nutrition_engine) reste PUR : Django ne fait que valider l'entrée,
appeler le moteur, et sérialiser la sortie pour le front React.

Arborescence type :
    apps/nutrition/
        engine.py          <- le moteur pur (fourni)
        met_table.csv      <- données MET (fourni)
        serializers.py     <- ce fichier (partie serializers)
        views.py           <- ce fichier (partie view)
        urls.py            -> path("api/targets/", NutritionTargetsView.as_view())

Le front React fait : POST /api/targets/  { profil... }  ->  { targets, meals }.
"""
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from dataclasses import asdict

from .engine import (
    Session, Profile, compute_targets, split_into_meals, assign_components,
)


# ---------------------------------------------------------------------------
# Serializers (validation de l'entrée venant de React)
# ---------------------------------------------------------------------------
class SessionSerializer(serializers.Serializer):
    sport = serializers.CharField()
    minutes = serializers.FloatField(min_value=1)
    per_week = serializers.IntegerField(min_value=1, max_value=21)
    intensity = serializers.CharField(required=False, allow_null=True, default=None)


class ProfileSerializer(serializers.Serializer):
    sex = serializers.ChoiceField(choices=["M", "F"])
    age = serializers.IntegerField(min_value=14, max_value=100)
    weight_kg = serializers.FloatField(min_value=30, max_value=300)
    height_cm = serializers.FloatField(min_value=120, max_value=230)
    objective = serializers.ChoiceField(
        choices=["maintien", "perte", "seche", "prise_muscle", "recomposition"])
    sessions = SessionSerializer(many=True, required=False, default=list)
    activity_level = serializers.ChoiceField(
        choices=["sedentaire", "leger", "actif", "tres_actif"], default="sedentaire")
    steps = serializers.IntegerField(required=False, allow_null=True, default=None)
    pace = serializers.ChoiceField(
        choices=["doux", "modere", "rapide"], required=False, allow_null=True, default=None)
    bodyfat_pct = serializers.FloatField(
        required=False, allow_null=True, default=None, min_value=3, max_value=60)
    diet = serializers.ChoiceField(
        choices=["omnivore", "vegetarien", "vegan"], default="omnivore")
    is_athlete = serializers.BooleanField(default=False)
    # Préférences repas (option breakfast/collation gérées par l'abonnement côté business)
    breakfast = serializers.ChoiceField(
        choices=["complet", "leger", "aucun"], default="complet")
    main_meal = serializers.ChoiceField(
        choices=["midi", "soir", "equilibre"], default="equilibre")

    def to_profile(self) -> tuple[Profile, str, str]:
        d = dict(self.validated_data)
        breakfast = d.pop("breakfast")
        main_meal = d.pop("main_meal")
        sessions = [Session(**s) for s in d.pop("sessions")]
        return Profile(sessions=sessions, **d), breakfast, main_meal


# ---------------------------------------------------------------------------
# View
# ---------------------------------------------------------------------------
class NutritionTargetsView(APIView):
    """POST un profil -> cibles journalières + répartition repas + assemblage midi."""

    def post(self, request):
        ser = ProfileSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        profile, breakfast, main_meal = ser.to_profile()

        targets = compute_targets(profile)
        meals = split_into_meals(targets, breakfast=breakfast, main_meal=main_meal)
        midi_components = assign_components(meals["midi"]) if "midi" in meals else None

        return Response({
            "targets": asdict(targets),
            "meals": meals,
            "midi_components": midi_components,
        })


# ---------------------------------------------------------------------------
# Exemple de payload attendu depuis React (POST /api/targets/) :
# {
#   "sex": "M", "age": 26, "weight_kg": 75, "height_cm": 177,
#   "objective": "prise_muscle", "steps": 9000, "pace": "doux", "bodyfat_pct": 12,
#   "sessions": [{"sport": "Musculation", "minutes": 75, "per_week": 4, "intensity": "elevee"}],
#   "breakfast": "complet", "main_meal": "equilibre"
# }
# ---------------------------------------------------------------------------
