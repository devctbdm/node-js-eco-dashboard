import { OrbitParticles } from "@/components/loaders";

export default function AdminLoading() {
  return (
    <div
      className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center"
      role="status"
    >
      <span className="sr-only">Loading page</span>
      <OrbitParticles />
    </div>
  );
}
