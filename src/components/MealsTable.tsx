import type { Meal } from "../types";

const LABELS: Record<string, string> = {
  petit_dej: "Petit déjeuner",
  midi: "Midi",
  collation: "Collation",
  soir: "Soir",
};

export function MealsTable({ meals }: { meals: Record<string, Meal> }) {
  const order = ["petit_dej", "midi", "collation", "soir"].filter((k) => k in meals);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-3">Repas</th>
            <th className="py-2 px-3 text-right">kcal</th>
            <th className="py-2 px-3 text-right">P (g)</th>
            <th className="py-2 px-3 text-right">G (g)</th>
            <th className="py-2 px-3 text-right">L (g)</th>
          </tr>
        </thead>
        <tbody>
          {order.map((k) => {
            const m = meals[k];
            return (
              <tr key={k} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-3 font-medium">{LABELS[k] ?? k}</td>
                <td className="py-2 px-3 text-right">{Math.round(m.kcal)}</td>
                <td className="py-2 px-3 text-right text-protein">{Math.round(m.protein_g)}</td>
                <td className="py-2 px-3 text-right text-carb">{Math.round(m.carb_g)}</td>
                <td className="py-2 px-3 text-right text-fat">{Math.round(m.fat_g)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
