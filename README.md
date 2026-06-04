# Nutrition sportive — mini app

Mini application web qui calcule des cibles nutritionnelles sportives à partir d'un profil :
**BMR → TDEE → calories cibles → macros (P/G/L) → fibres → garde-fous → répartition repas**.

- **Frontend** : React + Vite + TypeScript + Tailwind
- **Backend** : FastAPI déployé en **serverless function** Vercel
- **Hébergement** : tout sur Vercel (1 seul service)

## Architecture

```
ocal2/
├── nutrition_engine/      # moteur Python pur (BMR, MET, macros…)
├── api/
│   └── index.py           # FastAPI : POST /api/targets, GET /api/health
├── src/                   # React (Vite)
├── index.html             # entrée Vite
├── package.json           # deps frontend
├── requirements.txt       # deps Python (lues par Vercel)
├── vercel.json            # routes /api/* → api/index.py
├── run_examples.py        # harnais CLI
└── django_integration_example.py  # exemple DRF (référence historique)
```

## Dev local

### Backend (port 8000)

```powershell
pip install -r requirements.txt uvicorn
python -m uvicorn api.index:app --reload --port 8000
```

- API : http://localhost:8000/api/targets
- Doc auto : http://localhost:8000/docs

### Frontend (port 5173)

```powershell
copy .env.example .env.local
npm install
npm run dev
```

Le frontend lit `VITE_API_URL` (vide en prod = même origine ; `http://localhost:8000` en dev local).

### Tester le moteur en CLI

```powershell
python run_examples.py
```

Doit produire les 3 profils Léa / Yanis / Karim avec des cibles ~1640 / ~3550 / ~2750 kcal.

## Exemple de payload

```json
POST /api/targets
{
  "sex": "M",
  "age": 26,
  "weight_kg": 75,
  "height_cm": 177,
  "objective": "prise_muscle",
  "steps": 9000,
  "pace": "doux",
  "bodyfat_pct": 12,
  "sessions": [
    { "sport": "Musculation", "minutes": 75, "per_week": 4, "intensity": "elevee" }
  ],
  "breakfast": "complet",
  "main_meal": "equilibre"
}
```

Réponse : `{ targets: {…}, meals: {…} }`.

## Déploiement (Vercel)

1. Push sur GitHub
2. Importer le repo dans Vercel — **Root Directory = `./`**
3. Vercel auto-détecte Vite (via `package.json` à la racine) + Python (via `requirements.txt` + dossier `api/`)
4. Aucune variable d'env à configurer

Vercel :
- Build le frontend (`npm install && npm run build`)
- Déploie `api/index.py` comme serverless function (avec `nutrition_engine/` bundlé via `includeFiles`)
- Sert le SPA depuis `dist/`
- Route `/api/*` vers la fonction Python

## Points scientifiques

Toutes les constantes du moteur ([nutrition_engine/engine.py](nutrition_engine/engine.py)) sont justifiées :
Mifflin-St Jeor / Cunningham / Ten-Haaf pour le BMR, MET (FAO/WHO) pour le sport, plafonds de variation (Garthe 2011, Helms 2014), seuil RED-S (Loucks 2011, IOC 2023), planchers protéines & lipides hormonal.
