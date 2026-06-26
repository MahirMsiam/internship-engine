"use client";

import { useState } from "react";
import { logInteraction } from "@/lib/api";
import { Recommendation } from "@/types";
import ScoreBar from "./ScoreBar";

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { matchBreakdown } = recommendation;

  async function handleSave() {
    setSaved(true);
    await logInteraction(recommendation.id, "save");
  }

  async function handleApply() {
    setApplied(true);
    await logInteraction(recommendation.id, "apply");
  }

  async function handleDismiss() {
    setDismissed(true);
    await logInteraction(recommendation.id, "dismiss");
  }

  if (dismissed) {
    return null;
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {recommendation.internshipTitle}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {recommendation.companyName} • {recommendation.location}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Deadline: {recommendation.deadline}
          </p>

          {recommendation.remoteOk && (
            <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Remote available
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-slate-900 px-5 py-4 text-center text-white">
          <p className="text-xs font-medium text-slate-300">Match</p>
          <p className="text-3xl font-bold">
            {matchBreakdown.compositeScore}%
          </p>
        </div>
      </div>

      <p className="mt-5 leading-7 text-slate-600">
        {matchBreakdown.narrative}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ScoreBar label="Skill Match" value={matchBreakdown.skillMatch} />
        <ScoreBar label="Domain Match" value={matchBreakdown.domainMatch} />
        <ScoreBar
          label="Education Match"
          value={matchBreakdown.educationMatch}
        />
        <ScoreBar
          label="Experience Match"
          value={matchBreakdown.experienceMatch}
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-900">Matched skills</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {matchBreakdown.matchedSkills.map((skill) => (
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
        <p className="text-sm font-semibold text-slate-900">Missing skills</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {matchBreakdown.missingSkills.map((skill) => (
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
        <button
          onClick={handleApply}
          disabled={applied}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {applied ? "Applied" : "Apply"}
        </button>

        <button
          onClick={handleSave}
          disabled={saved}
          className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {saved ? "Saved" : "Save"}
        </button>

        <button
          onClick={handleDismiss}
          className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Dismiss
        </button>
      </div>
    </article>
  );
}