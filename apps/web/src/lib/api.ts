import { InteractionType } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function logInteraction(
  internshipId: string,
  eventType: InteractionType
) {
  if (!API_BASE_URL) {
    console.log("Mock interaction:", {
      internshipId,
      eventType,
    });

    return;
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  await fetch(`${API_BASE_URL}/interactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      internship_id: internshipId,
      event_type: eventType,
    }),
  });
}