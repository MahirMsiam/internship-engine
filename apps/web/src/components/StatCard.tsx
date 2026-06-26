import { DashboardStat } from "@/types";

type StatCardProps = {
  stat: DashboardStat;
};

export default function StatCard({ stat }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{stat.title}</p>

      <h3 className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</h3>

      <p className="mt-2 text-sm text-slate-500">{stat.description}</p>
    </div>
  );
}