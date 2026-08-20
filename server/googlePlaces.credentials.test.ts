import { describe, expect, it } from "vitest";

describe("Google Places credentials", () => {
  it("accepts the configured server API key", async () => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    expect(apiKey, "GOOGLE_PLACES_API_KEY must be configured").toBeTruthy();

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey as string,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: "clínicas em Curitiba, Paraná, Brasil",
        languageCode: "pt-BR",
        regionCode: "BR",
        pageSize: 1,
      }),
    });

    const payload = await response.json() as { error?: { message?: string }; places?: unknown[] };
    expect(response.ok, payload.error?.message ?? `Google Places returned HTTP ${response.status}`).toBe(true);
    expect(Array.isArray(payload.places)).toBe(true);
  }, 30_000);
});
