import { ENV } from "./_core/env";

const GOOGLE_PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

export type GooglePlaceSearchInput = {
  query: string;
  city: string;
  state: string;
  limit: number;
};

export type GooglePlaceResult = {
  sourceKey: string;
  placeId: string | null;
  name: string;
  segment: string;
  city: string;
  state: string;
  phone: string | null;
  address: string | null;
  mapsUrl: string | null;
};

type GooglePlacesResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    googleMapsUri?: string;
    primaryTypeDisplayName?: { text?: string };
  }>;
  error?: { message?: string };
};

export async function searchGooglePlaces(input: GooglePlaceSearchInput): Promise<GooglePlaceResult[]> {
  if (!ENV.googlePlacesApiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY não configurada no servidor");
  }

  const textQuery = [input.query.trim(), input.city.trim(), input.state.trim(), "Brasil"]
    .filter(Boolean)
    .join(", ");

  const response = await fetch(GOOGLE_PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": ENV.googlePlacesApiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.googleMapsUri",
        "places.primaryTypeDisplayName",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "pt-BR",
      regionCode: "BR",
      pageSize: Math.min(Math.max(input.limit, 1), 20),
      includePureServiceAreaBusinesses: false,
    }),
  });

  const payload = await response.json() as GooglePlacesResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Google Places retornou HTTP ${response.status}`);
  }

  return (payload.places ?? []).flatMap(place => {
    const name = place.displayName?.text?.trim();
    if (!name) return [];

    return [{
      sourceKey: place.id ? `google:${place.id}` : `google:${name.toLowerCase()}:${input.city.toLowerCase()}`,
      placeId: place.id ?? null,
      name,
      segment: input.query.trim(),
      city: input.city.trim(),
      state: input.state.trim().toUpperCase(),
      phone: place.nationalPhoneNumber ?? null,
      address: place.formattedAddress ?? null,
      mapsUrl: place.googleMapsUri ?? null,
    }];
  });
}
