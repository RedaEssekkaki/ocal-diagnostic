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
├── frontend/              # React SPA (Vite)
├── requirements.txt       # deps Python (lues par Vercel)
├── vercel.json            # build + routes /api/* → api/index.py
├── run_examples.py        # harnais CLI (test de non-régression)
└── django_integration_example.py  # exemple d'intégration DRF (référence historique)
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
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Le frontend lit `VITE_API_URL` (par défaut vide = même origine). En local, mettre `VITE_API_URL=http://localhost:8000` dans `.env.local`.

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

### 1. Pousser sur GitHub

```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<toi>/<repo>.git
git push -u origin main
```

### 2. Importer dans Vercel

1. Sur https://vercel.com → **Add New → Project**, sélectionner le repo.
2. **Root Directory** : laisser à la racine du repo (Vercel détecte automatiquement [vercel.json](vercel.json)).
3. Aucune variable d'env à configurer — front et back sur la même origine.
4. **Deploy**.

Vercel va :
- Builder le frontend via `cd frontend && npm install && npm run build`
- Déployer `api/index.py` comme serverless function Python (avec `nutrition_engine/` bundlé via `includeFiles`)
- Servir le SPA depuis `frontend/dist/`
- Router `/api/*` vers la fonction Python

### Notes Vercel

- **Cold start** : ~1-2 s à la 1re requête après inactivité (vs 30 s sur Render free).
- **Timeout** : 10 s par requête sur Hobby plan (notre calcul prend <50 ms, donc OK).
- **Logs** : disponibles dans le dashboard Vercel sous "Functions".

## Points scientifiques

Toutes les constantes du moteur ([nutrition_engine/engine.py](nutrition_engine/engine.py)) sont justifiées :
Mifflin-St Jeor / Cunningham / Ten-Haaf pour le BMR, MET (FAO/WHO) pour le sport, plafonds de variation (Garthe 2011, Helms 2014), seuil RED-S (Loucks 2011, IOC 2023), planchers protéines & lipides hormonal.
