import type { EntityId, Place, TripCandidate } from "../domain";
import type { DuriState } from "./useDuriStore";

export const selectCurrentUser = (state: DuriState) => state.usersById[state.currentUserId];
export const selectActiveTrip = (state: DuriState) => state.tripsById[state.activeTripId];
export const selectTripById = (state: DuriState, tripId: EntityId) => state.tripsById[tripId];
export const selectTripMembers = (state: DuriState, tripId: EntityId) => {
  const trip = selectTripById(state, tripId);
  return trip?.members.map((member) => state.usersById[member.userId]).filter(Boolean) ?? [];
};
export const selectTripCandidates = (state: DuriState, tripId: EntityId) => state.candidatesByTripId[tripId] ?? [];
export const selectTripItinerary = (state: DuriState, tripId: EntityId) => state.itineraryByTripId[tripId] ?? [];
export const selectSavedPlacesForCurrentUser = (state: DuriState) =>
  (state.savedPlaceIdsByUserId[state.currentUserId] ?? []).map((id) => state.placesById[id]).filter(Boolean);
export const selectTripAnalysis = (state: DuriState, tripId: EntityId) => state.analysesByTripId[tripId];
export const selectPlaceById = (state: DuriState, placeId: EntityId) => state.placesById[placeId];
export const selectAllPlaces = (state: DuriState) => Object.values(state.placesById);
export const selectScheduledPlaceIds = (state: DuriState, tripId: EntityId) =>
  new Set(selectTripItinerary(state, tripId).flatMap((item) => (item.placeId ? [item.placeId] : [])));
export const selectAvailableCandidates = (state: DuriState, tripId: EntityId) => {
  const scheduledIds = selectScheduledPlaceIds(state, tripId);
  return selectTripCandidates(state, tripId).filter((candidate) => !scheduledIds.has(candidate.placeId));
};

export type TripStats = {
  candidateCount: number;
  scheduledCount: number;
  unplannedCount: number;
  companionCount: number;
  completedPreferenceCount: number;
  preferenceTargetCount: number;
};

export function selectTripStats(state: DuriState, tripId: EntityId): TripStats {
  const trip = selectTripById(state, tripId);
  const candidates = selectTripCandidates(state, tripId);
  const candidateIds = new Set(candidates.map((candidate) => candidate.placeId));
  const scheduledCandidateIds = new Set(
    selectTripItinerary(state, tripId).flatMap((item) => (item.placeId && candidateIds.has(item.placeId) ? [item.placeId] : [])),
  );
  const preferenceTargetCount = trip?.members.length ?? 0;
  const completedPreferenceCount = trip?.members.filter((member) => member.preferenceStatus === "completed").length ?? 0;
  return {
    candidateCount: candidates.length,
    scheduledCount: scheduledCandidateIds.size,
    unplannedCount: Math.max(candidates.length - scheduledCandidateIds.size, 0),
    companionCount: preferenceTargetCount,
    completedPreferenceCount,
    preferenceTargetCount,
  };
}

export function resolveCandidatePlaces(
  candidates: TripCandidate[],
  placesById: Record<EntityId, Place>,
) {
  return candidates.flatMap((candidate) => {
    const place = placesById[candidate.placeId];
    return place ? [{ candidate, place }] : [];
  });
}
