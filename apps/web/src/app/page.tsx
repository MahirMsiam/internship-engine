const stats = [
  {
    title: "Career Readiness",
    value: "78%",
    description: "Based on skills, resume and target role",
  },
  {
    title: "Recommended Internships",
    value: "12",
    description: "AI-matched opportunities for you",
  },
  {
    title: "Profile Strength",
    value: "82%",
    description: "Your profile completion score",
  },
];

const recommendations = [
  {
    title: "Frontend Developer Intern",
    company: "TechNova",
    location: "Remote",
    deadline: "30 July 2026",
    match: 84,
    matchedSkills: ["React", "TypeScript", "Tailwind CSS"],
    missingSkills: ["Testing", "Next.js Advanced"],
    description:
      "You are a strong match because your frontend skills align well with this internship. Improving testing knowledge can make your profile stronger.",
  },
  {
    title: "UI/UX Engineering Intern",
    company: "BrightApps",
    location: "Dhaka",
    deadline: "12 August 2026",
    match: 75,
    matchedSkills: ["HTML", "CSS", "Figma", "React"],
    missingSkills: ["Accessibility", "Design System"],
    description:
      "This internship fits your UI interest. Learning accessibility and design system basics will improve your match score.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Internship Engine
            </h1>
            <p className="text-sm text-slate-500">
              AI-based internship recommendation platform
            </p>
          </div>

          <button className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            Sign in
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-sm font-medium text-slate-300">
            Student Dashboard
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-bold leading-tight">
            Find internships that match your skills, profile, and career goals.
          </h2>

          <p className="mt-4 max-w-2xl text-slate-300">
            View AI-based recommendations, match breakdowns, missing skills,
            and application actions in one clean dashboard.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {stat.title}
              </p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">
                {stat.value}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {stat.description}
              </p>
            </div>
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

        <div className="mt-6 grid gap-6">
          {recommendations.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.company} • {item.location}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Deadline: {item.deadline}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 px-5 py-4 text-center text-white">
                  <p className="text-xs font-medium text-slate-300">Match</p>
                  <p className="text-3xl font-bold">{item.match}%</p>
                </div>
              </div>

              <p className="mt-5 leading-7 text-slate-600">
                {item.description}
              </p>

              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-900">
                  Matched skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900">
                  Missing skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Apply
                </button>
                <button className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Save
                </button>
                <button className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Dismiss
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}