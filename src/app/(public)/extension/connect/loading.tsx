import { SkeletonRegion } from "@/components/feedback/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <SkeletonRegion className="bg-card max-w-md rounded-2xl border p-6">
        <Skeleton className="mx-auto size-14 rounded-2xl" />
        <Skeleton className="mx-auto mt-5 h-7 w-4/5" />
        <Skeleton className="mt-5 h-16" />
        <Skeleton className="mt-5 h-10" />
      </SkeletonRegion>
    </main>
  );
}
