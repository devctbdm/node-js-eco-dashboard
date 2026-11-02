"use client";
import { cn } from "@/lib/utils";

interface OrbitParticlesProps {
  className?: string;
  size?: number;
}

export function OrbitParticles({ className, size = 56 }: OrbitParticlesProps) {
  const particles = 3;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full border border-dashed border-border animate-loader-spin" />
      {Array.from({ length: particles }).map((_, i) => {
        const angle = (i / particles) * 360;
        return (
          <div
            key={i}
            className="absolute inset-0 animate-loader-orbit"
            style={{
              animationDuration: "2s",
              animationDelay: `${i * -0.66}s`,
            }}
          >
            <span
              className="absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary animate-loader-orbit-particle"
              style={{
                transform: `rotate(${angle}deg) translateY(-${size / 2}px)`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
