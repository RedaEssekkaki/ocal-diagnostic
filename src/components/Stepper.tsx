import { Fragment } from "react";

interface Props {
  count: number;
  current: number;
}

export function Stepper({ count, current }: Props) {
  return (
    <div className="flex items-center justify-center max-w-md mx-auto my-6 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <Fragment key={i}>
          <div
            className={`h-3.5 w-3.5 shrink-0 rounded-full transition-colors ${
              i <= current ? "bg-primary" : "bg-slate-300"
            }`}
            aria-current={i === current ? "step" : undefined}
          />
          {i < count - 1 && (
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < current ? "bg-primary" : "bg-slate-300"
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
