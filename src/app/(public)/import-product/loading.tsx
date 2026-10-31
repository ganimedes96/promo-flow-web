import { OfferFormSkeleton } from "@/components/feedback/loading-skeletons";
export default function Loading() {
  return (
    <main className="bg-background min-h-svh px-4 py-8 sm:px-8">
      <div className="bg-card mx-auto max-w-5xl rounded-2xl border">
        <OfferFormSkeleton />
      </div>
    </main>
  );
}
