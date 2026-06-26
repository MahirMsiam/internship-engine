import Header from "@/components/Header";
import RecommendationList from "@/components/RecommendationList";
import { recommendations } from "@/data/mockData";

export default function RecommendationsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            All Recommendations
          </h1>

          <p className="mt-2 text-slate-500">
            Search, save, apply or dismiss recommended internships.
          </p>
        </div>

        <div className="mt-8">
          <RecommendationList recommendations={recommendations} />
        </div>
      </section>
    </main>
  );
}