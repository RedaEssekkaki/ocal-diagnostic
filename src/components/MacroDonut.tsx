import type { Targets } from "../types";

const COLORS = { Protéines: "#534AB7", Glucides: "#BA7517", Lipides: "#0F6E56", Fibres: "#2563EB" };

function slicePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large},1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
}

export function MacroDonut({ t }: { t: Targets }) {
  const parts = {
    Protéines: { g: t.protein_g, kcal: t.protein_g * 4 },
    Glucides: { g: t.carb_g, kcal: t.carb_g * 4 },
    Lipides: { g: t.fat_g, kcal: t.fat_g * 9 },
  };
  const totalKcal = parts.Protéines.kcal + parts.Glucides.kcal + parts.Lipides.kcal || 1;

  const cx = 120;
  const cy = 120;
  const r = 100;
  let a = -Math.PI / 2;
  const segments: { name: keyof typeof parts; d: string; pct: number; g: number }[] = [];
  (Object.entries(parts) as [keyof typeof parts, typeof parts.Protéines][]).forEach(([name, v]) => {
    const frac = v.kcal / totalKcal;
    const a1 = a + frac * 2 * Math.PI;
    segments.push({ name, d: slicePath(cx, cy, r, a, a1), pct: Math.round(100 * frac), g: Math.round(v.g) });
    a = a1;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-60 h-60 shrink-0">
        <svg viewBox="0 0 240 240" className="w-full h-full" role="img" aria-label="Donut des macros">
          {segments.map((s) => (
            <path key={s.name} d={s.d} fill={COLORS[s.name]} />
          ))}
          <circle cx={cx} cy={cy} r={62} fill="#fff" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-semibold">{Math.round(t.calories)}</div>
          <div className="text-xs text-slate-500">kcal / jour</div>
        </div>
      </div>
      <ul className="flex-1 flex flex-col gap-3 w-full">
        {segments.map((s) => (
          <li key={s.name} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[s.name] }} />
            <span className="font-medium w-24">{s.name}</span>
            <strong className="w-12 text-right">{s.pct}%</strong>
            <span className="text-slate-500">· {s.g} g</span>
          </li>
        ))}
        <li className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-sm" style={{ background: COLORS.Fibres }} />
          <span className="font-medium w-24">Fibres</span>
          <span className="w-12" aria-hidden="true" />
          <span className="text-slate-500">· {t.fiber_g} g</span>
        </li>
      </ul>
    </div>
  );
}
