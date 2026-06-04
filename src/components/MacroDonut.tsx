import type { Targets } from "../types";

const COLORS = { Protéines: "#635BFF", Glucides: "#F59E0B", Lipides: "#F43F5E", Fibres: "#10B981" } as const;
const LABELS = { Protéines: "PROTÉINES", Glucides: "GLUCIDES", Lipides: "LIPIDES" } as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

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
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-10">
      <div className="flex justify-center lg:justify-start">
        <div className="relative h-52 w-52 shrink-0 sm:h-56 sm:w-56">
          <svg viewBox="0 0 240 240" className="h-full w-full drop-shadow-sm" role="img" aria-label="Donut des macros">
            {segments.map((s) => (
              <path key={s.name} d={s.d} fill={COLORS[s.name]} stroke="#fff" strokeLinejoin="round" strokeWidth={4} />
            ))}
            <circle cx={cx} cy={cy} r={62} fill="#fff" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] font-extrabold uppercase text-slate-400">Énergie totale</div>
            <div className="mt-1 text-3xl font-extrabold leading-none text-ocal-green">{formatNumber(t.calories)}</div>
            <div className="mt-1 text-xs font-semibold uppercase text-slate-400">kcal</div>
          </div>
        </div>
      </div>

      <div className="grid w-full gap-3">
        <ul className="grid gap-3">
          {segments.map((s) => (
            <li
              key={s.name}
              className="flex min-h-[48px] items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3"
              style={{
                borderColor: `${COLORS[s.name]}33`,
                boxShadow: `0 14px 32px -24px ${COLORS[s.name]}`,
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: COLORS[s.name], boxShadow: `0 0 0 4px ${COLORS[s.name]}1F` }}
                />
                <span className="truncate text-[11px] font-extrabold uppercase text-ocal-green">{LABELS[s.name]}</span>
              </div>
              <div className="flex shrink-0 items-baseline gap-2 text-sm font-extrabold" style={{ color: COLORS[s.name] }}>
                <strong className="font-extrabold">{s.pct}%</strong>
                <span className="text-slate-300">·</span>
                <span>{s.g} g</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 px-2 pt-3 text-[11px] font-extrabold uppercase text-slate-500">
          <span>Fibres</span>
          <span className="text-slate-300">·</span>
          <span style={{ color: COLORS.Fibres }}>{Math.round(t.fiber_g)} g</span>
        </div>
      </div>
    </div>
  );
}
