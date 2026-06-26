"use client";

import { useState } from "react";
import { Recommendation } from "@/types";
import RecommendationCard from "./RecommendationCard";

type RecommendationListProps = {
  recommendations: Recommendation[];
};

export default function RecommendationList({
  recommendations,
}: RecommendationListProps) {
  const [search, setSearch] = useState("");

  const filteredRecommendations = recommendations.filter((item) => {
    const text = `${item.internshipTitle} ${item.companyName} ${item.location}`
      .toLowerCase()
      .trim();

    return text.includes(search.toLowerCase().trim());
  });

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search internships..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm outline-none transition focus:border-slate-900"
        />
      </div>

      <div className="grid gap-6">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No recommendations found.
          </div>
        )}
      </div>
    </div>
  );
}