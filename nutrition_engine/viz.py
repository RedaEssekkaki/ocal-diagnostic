# -*- coding: utf-8 -*-
"""
Génère un visuel (donut des macros) en HTML autonome — pur SVG, sans JavaScript
ni connexion internet. Ouvre le fichier .html dans n'importe quel navigateur.
"""
import math
from .engine import Targets

_COLORS = {"Protéines": "#534AB7", "Glucides": "#BA7517", "Lipides": "#0F6E56"}


def _slice_path(cx, cy, r, a0, a1):
    x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
    x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
    large = 1 if (a1 - a0) > math.pi else 0
    return f"M{cx:.1f},{cy:.1f} L{x0:.1f},{y0:.1f} A{r},{r} 0 {large},1 {x1:.1f},{y1:.1f} Z"


def macro_chart_html(t: Targets, title: str = "Répartition des macros") -> str:
    """Retourne une page HTML complète affichant le donut des macros."""
    parts = {
        "Protéines": (t.protein_g, t.protein_g * 4),
        "Glucides":  (t.carb_g,    t.carb_g * 4),
        "Lipides":   (t.fat_g,     t.fat_g * 9),
    }
    total_kcal = sum(k for _, k in parts.values()) or 1

    cx = cy = 120
    r = 100
    segments, legend, a = [], [], -math.pi / 2
    for name, (grams, kcal) in parts.items():
        frac = kcal / total_kcal
        a1 = a + frac * 2 * math.pi
        segments.append(f'<path d="{_slice_path(cx, cy, r, a, a1)}" fill="{_COLORS[name]}"/>')
        pct = round(100 * frac)
        legend.append(
            f'<div style="display:flex;align-items:center;gap:8px;margin:6px 0;font-size:15px;">'
            f'<span style="width:12px;height:12px;border-radius:3px;background:{_COLORS[name]};"></span>'
            f'<span style="min-width:90px;">{name}</span>'
            f'<strong>{pct}\u00a0%</strong>'
            f'<span style="color:#666;">&middot; {round(grams)}\u00a0g</span></div>'
        )
        a = a1

    return f"""<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<title>{title}</title>
<style>
  body{{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
       color:#1a1a1a;background:#fff;margin:0;padding:32px;}}
  .card{{max-width:460px;margin:auto;}}
  h1{{font-size:20px;font-weight:600;margin:0 0 4px;}}
  .sub{{color:#666;font-size:14px;margin:0 0 20px;}}
  .wrap{{position:relative;width:240px;height:240px;margin:0 auto 16px;}}
  .center{{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;}}
  .kcal{{font-size:26px;font-weight:600;}}
  .kcal-lbl{{font-size:13px;color:#666;}}
</style></head>
<body><div class="card">
  <h1>{title}</h1>
  <p class="sub">{round(t.calories)} kcal / jour</p>
  <div class="wrap">
    <svg viewBox="0 0 240 240" width="240" height="240" role="img"
         aria-label="Donut des macros">
      {''.join(segments)}
      <circle cx="{cx}" cy="{cy}" r="62" fill="#fff"/>
    </svg>
    <div class="center"><div class="kcal">{round(t.calories)}</div>
      <div class="kcal-lbl">kcal / jour</div></div>
  </div>
  {''.join(legend)}
</div></body></html>"""


def save_macro_chart(t: Targets, path: str, title: str = "Répartition des macros") -> str:
    with open(path, "w", encoding="utf-8") as f:
        f.write(macro_chart_html(t, title))
    return path
