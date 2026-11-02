import { cn } from "@/lib/utils";

interface RipplePulseProps {
  className?: string;
  size?: number;
}

export function RipplePulse({ className, size = 56 }: RipplePulseProps) {
  const rings = 3;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: rings }).map((_, i) => (
        <span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-primary animate-loader-ring-pulse"
          style={{ animationDelay: `${i * 500}ms` }}
        />
      ))}
      <span className="h-3 w-3 rounded-full bg-primary" />
    </div>
  );
}
