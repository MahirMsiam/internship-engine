import Header from "@/components/Header";
import RecommendationList from "@/components/RecommendationList";
import StatCard from "@/components/StatCard";
import { dashboardStats, recommendations } from "@/data/mockData";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm font-medium text-slate-300">
            Student Dashboard
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight">
            Find internships that match your skills, profile, and career goals.
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            View AI-based recommendations, match breakdowns, missing skills,
            and application actions in one clean dashboard.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Recommended Internships
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Mock frontend data. API connection will be added later.
          </p>
        </div>

        <div className="mt-6">
          <RecommendationList recommendations={recommendations} />
        </div>
      </section>
    </main>
  );
}