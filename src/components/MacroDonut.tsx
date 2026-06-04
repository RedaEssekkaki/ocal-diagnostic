import type { Targets } from "../types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = { Protéines: "#635BFF", Glucides: "#F59E0B", Lipides: "#F43F5E", Fibres: "#10B981" } as const;
const LABELS = { Protéines: "PROTÉINES", Glucides: "GLUCIDES", Lipides: "LIPIDES" } as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

export function MacroDonut({ t }: { t: Targets }) {
  const parts = {
    Protéines: { g: t.protein_g, kcal: t.protein_g * 4 },
    Glucides: { g: t.carb_g, kcal: t.carb_g * 4 },
    Lipides: { g: t.fat_g, kcal: t.fat_g * 9 },
  };
  const totalKcal = parts.Protéines.kcal + parts.Glucides.kcal + parts.Lipides.kcal || 1;

  const segments = (Object.entries(parts) as [keyof typeof parts, typeof parts.Protéines][]).map(([name, v]) => {
    const frac = v.kcal / totalKcal;
    return { name, kcal: v.kcal, pct: Math.round(100 * frac), g: Math.round(v.g) };
  });

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)] lg:gap-10">
      <div className="flex justify-center lg:justify-start">
        <div className="relative h-52 w-52 shrink-0 sm:h-56 sm:w-56">
          <ResponsiveContainer width="100%" height="100%" className="drop-shadow-sm">
            <PieChart role="img" aria-label="Donut des macros">
              <Tooltip
                cursor={false}
                formatter={(value, _name, item) => {
                  const macro = item.payload as (typeof segments)[number];
                  return [`${formatNumber(Number(value))} kcal`, LABELS[macro.name]];
                }}
              />
              <Pie
                data={segments}
                dataKey="kcal"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={100}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {segments.map((s) => (
                  <Cell key={s.name} fill={COLORS[s.name]} stroke="#fff" strokeWidth={4} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
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
