import type { EntityId, Place, TripCandidate } from "../domain";
import { exploreFilters } from "../data/travelPages";
import type { ExploreFilter } from "../data/travelPages";

export const DEFAULT_EXPLORE_FILTER: ExploreFilter = "전체";

export function normalizeExploreFilter(value: string | null): ExploreFilter {
  return exploreFilters.includes(value as ExploreFilter) ? (value as ExploreFilter) : DEFAULT_EXPLORE_FILTER;
}

export function filterExplorePlaces({
  places,
  query,
  filter,
  candidates,
  currentUserId,
  scheduledPlaceIds,
}: {
  places: Place[];
  query: string;
  filter: ExploreFilter;
  candidates: TripCandidate[];
  currentUserId: EntityId;
  scheduledPlaceIds: Set<EntityId>;
}) {
  const candidateByPlaceId = new Map(candidates.map((candidate) => [candidate.placeId, candidate]));
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return places.filter((place) => {
    const candidate = candidateByPlaceId.get(place.id);
    const matchesFilter = (() => {
      if (filter === "전체") return true;
      if (filter === "공통 관심") return Boolean(candidate && candidate.addedByUserIds.length > 1);
      if (filter === "내가 담은") return Boolean(candidate?.addedByUserIds.includes(currentUserId));
      if (filter === "두리 추천") return Boolean(candidate?.recommendedByDuri);
      if (filter === "미배치") return Boolean(candidate && !scheduledPlaceIds.has(place.id));
      return place.category === filter || place.category.includes(filter) || place.tags.some((tag) => tag === filter || tag.includes(filter));
    })();

    if (!matchesFilter) return false;
    if (!normalizedQuery) return true;

    const searchableText = [
      place.name,
      place.category,
      ...place.tags,
      place.address,
      place.summary,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function updateExploreSearchParams(
  current: URLSearchParams,
  patch: { query?: string; filter?: ExploreFilter },
) {
  const next = new URLSearchParams(current);
  if (patch.query !== undefined) {
    const query = patch.query;
    if (query) next.set("q", query);
    else next.delete("q");
  }
  if (patch.filter !== undefined) {
    if (patch.filter === DEFAULT_EXPLORE_FILTER) next.delete("category");
    else next.set("category", patch.filter);
  }
  return next;
}

export function createExplorePath(pathname: "/explore" | "/explore/map", params: URLSearchParams) {
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}
