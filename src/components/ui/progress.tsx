import { cn } from "@/lib/cn";

interface ProgressProps {
  className?: string;
  value: number;
}

export function Progress({ className, value }: ProgressProps) {
  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-rose-100/80",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-200 transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
