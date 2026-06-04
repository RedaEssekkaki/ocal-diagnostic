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
    <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
      <div className="relative h-56 w-56 shrink-0 sm:h-60 sm:w-60">
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
      <ul className="grid w-full max-w-xs gap-3 text-sm sm:max-w-sm">
        {segments.map((s) => (
          <li key={s.name} className="grid grid-cols-[12px_minmax(88px,1fr)_52px_minmax(56px,auto)] items-center gap-3">
            <span className="h-3 w-3 rounded-sm" style={{ background: COLORS[s.name] }} />
            <span className="font-medium">{s.name}</span>
            <strong className="text-right">{s.pct}%</strong>
            <span className="text-slate-500">
              <span className="text-slate-300">·</span> {s.g} g
            </span>
          </li>
        ))}
        <li className="grid grid-cols-[12px_minmax(88px,1fr)_52px_minmax(56px,auto)] items-center gap-3">
          <span className="h-3 w-3 rounded-sm" style={{ background: COLORS.Fibres }} />
          <span className="font-medium">Fibres</span>
          <span aria-hidden="true" />
          <span className="text-slate-500">
            <span className="text-slate-300">·</span> {t.fiber_g} g
          </span>
        </li>
      </ul>
    </div>
  );
}
