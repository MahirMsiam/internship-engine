import Header from "@/components/Header";
import ResumeUploader from "@/components/ResumeUploader";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Profile</h1>

          <p className="mt-2 text-slate-500">
            Manage your profile, skills, and CV for better internship matching.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ResumeUploader />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Profile Summary
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              This section will later show extracted skills, education,
              experience, and career readiness after CV parsing.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold">Target Role:</span> Frontend
                Developer Intern
              </p>
              <p>
                <span className="font-semibold">Current Skills:</span> React,
                TypeScript, Tailwind CSS
              </p>
              <p>
                <span className="font-semibold">Missing Skills:</span> Testing,
                API Integration
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}