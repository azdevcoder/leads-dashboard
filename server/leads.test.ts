import { afterEach, describe, expect, it, vi } from "vitest";
import { leadStatus } from "../drizzle/schema";
import { searchGooglePlaces } from "./googlePlaces";

describe("leads domain", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the four supported atendimento statuses in order", () => {
    expect(leadStatus).toEqual(["Aguardando", "Em Atendimento", "Atendido", "Recusado"]);
  });

  it("normalizes a Google Places result for import", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      places: [{
        id: "ChIJ-example",
        displayName: { text: "Clínica Exemplo" },
        formattedAddress: "Rua Exemplo, 10 - Curitiba - PR, Brasil",
        nationalPhoneNumber: "+55 41 3333-0000",
        googleMapsUri: "https://maps.google.com/?cid=example",
      }],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    const result = await searchGooglePlaces({ query: "clínicas", city: "Curitiba", state: "PR", limit: 5 });

    expect(result).toEqual([{
      sourceKey: "google:ChIJ-example",
      placeId: "ChIJ-example",
      name: "Clínica Exemplo",
      segment: "clínicas",
      city: "Curitiba",
      state: "PR",
      phone: "+55 41 3333-0000",
      address: "Rua Exemplo, 10 - Curitiba - PR, Brasil",
      mapsUrl: "https://maps.google.com/?cid=example",
    }]);
  });

  it("surfaces Google API errors without leaking the API key", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { message: "The caller does not have permission" },
    }), { status: 403 })));

    await expect(searchGooglePlaces({ query: "clínicas", city: "Curitiba", state: "PR", limit: 5 }))
      .rejects.toThrow("The caller does not have permission");
  });
});
