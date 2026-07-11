import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EntityId,
  ItineraryItem,
  TripBudgetLevel,
  TripIntensity,
  TripRoom,
  TripTransport,
} from "../domain";
import { createDemoData, type DuriDomainState } from "../mocks/demoData";
import { isValidISODate } from "../utils/formatters";
import { createUniqueEntityId } from "../utils/ids";

export type AddPlaceToItineraryInput = {
  tripId: EntityId;
  placeId: EntityId;
  date: string;
  startTime?: string;
  durationMinutes?: number;
  preferredByUserIds?: EntityId[];
};

export type CreateTripInput = {
  title?: string;
  regionId: EntityId;
  startDate: string;
  endDate: string;
  transport: TripTransport;
  budgetLevel: TripBudgetLevel;
  intensity: TripIntensity;
  invitedUserIds: EntityId[];
};

type DuriActions = {
  createTrip: (input: CreateTripInput) => EntityId;
  setActiveTrip: (tripId: EntityId) => void;
  toggleSavedPlace: (placeId: EntityId, userId?: EntityId) => void;
  addCandidatePlace: (tripId: EntityId, placeId: EntityId, addedByUserId?: EntityId) => void;
  removeCandidatePlace: (tripId: EntityId, placeId: EntityId) => void;
  addPlaceToItinerary: (input: AddPlaceToItineraryInput) => void;
  removeItineraryItem: (tripId: EntityId, itineraryItemId: EntityId) => void;
  updateItineraryItem: (
    tripId: EntityId,
    itineraryItemId: EntityId,
    patch: Partial<Omit<ItineraryItem, "id" | "tripId">>,
  ) => void;
  resetDemoData: () => void;
};

export type DuriState = DuriDomainState & DuriActions;

const defaultDurationForCategory = (category: string) => (category === "시장" ? 60 : 90);

function createItineraryId(state: DuriDomainState, tripId: EntityId, placeId: EntityId, date: string) {
  const prefix = `itinerary-${tripId}-${date}-${placeId}`;
  const existingIds = new Set((state.itineraryByTripId[tripId] ?? []).map((item) => item.id));
  let sequence = 1;
  while (existingIds.has(`${prefix}-${sequence}`)) sequence += 1;
  return `${prefix}-${sequence}`;
}

export const useDuriStore = create<DuriState>()(
  persist(
    (set) => ({
      ...createDemoData(),
      createTrip: (input) => {
        let createdTripId: EntityId = "";

        set((state) => {
          const region = state.regionsById[input.regionId];
          const currentUser = state.usersById[state.currentUserId];
          const hasValidDates =
            isValidISODate(input.startDate) &&
            isValidISODate(input.endDate) &&
            input.endDate >= input.startDate;

          if (!region || !currentUser || !hasValidDates) return state;

          createdTripId = createUniqueEntityId("trip", Object.keys(state.tripsById));
          const invitedUserIds = [...new Set(input.invitedUserIds)].filter(
            (userId) => userId !== state.currentUserId && Boolean(state.usersById[userId]),
          );
          const memberUserIds = [state.currentUserId, ...invitedUserIds];
          const trip: TripRoom = {
            id: createdTripId,
            title: input.title?.trim() || `${region.name} 여행`,
            regionId: region.id,
            startDate: input.startDate,
            endDate: input.endDate,
            status: "planning",
            transport: input.transport,
            budgetLevel: input.budgetLevel,
            intensity: input.intensity,
            members: memberUserIds.map((userId, index) => ({
              userId,
              role: index === 0 ? "owner" : "member",
              preferenceStatus: state.preferenceResultsByUserId[userId] ? "completed" : "pending",
            })),
          };

          return {
            activeTripId: trip.id,
            tripsById: { ...state.tripsById, [trip.id]: trip },
            tripOrder: [...state.tripOrder, trip.id],
            candidatesByTripId: { ...state.candidatesByTripId, [trip.id]: [] },
            itineraryByTripId: { ...state.itineraryByTripId, [trip.id]: [] },
          };
        });

        return createdTripId;
      },
      setActiveTrip: (tripId) =>
        set((state) => (state.tripsById[tripId] ? { activeTripId: tripId } : state)),
      toggleSavedPlace: (placeId, userId) =>
        set((state) => {
          const targetUserId = userId ?? state.currentUserId;
          if (!state.placesById[placeId] || !state.usersById[targetUserId]) return state;
          const currentIds = state.savedPlaceIdsByUserId[targetUserId] ?? [];
          const nextIds = currentIds.includes(placeId)
            ? currentIds.filter((id) => id !== placeId)
            : [...currentIds, placeId];
          return {
            savedPlaceIdsByUserId: {
              ...state.savedPlaceIdsByUserId,
              [targetUserId]: nextIds,
            },
          };
        }),
      addCandidatePlace: (tripId, placeId, addedByUserId) =>
        set((state) => {
          const trip = state.tripsById[tripId];
          const targetUserId = addedByUserId ?? state.currentUserId;
          if (!trip || !state.placesById[placeId] || !trip.members.some((member) => member.userId === targetUserId)) return state;
          const current = state.candidatesByTripId[tripId] ?? [];
          const existing = current.find((candidate) => candidate.placeId === placeId);
          const next = existing
            ? current.map((candidate) =>
                candidate.placeId === placeId && !candidate.addedByUserIds.includes(targetUserId)
                  ? { ...candidate, addedByUserIds: [...candidate.addedByUserIds, targetUserId] }
                  : candidate,
              )
            : [
                ...current,
                { tripId, placeId, addedByUserIds: [targetUserId], recommendedByDuri: false },
              ];
          return { candidatesByTripId: { ...state.candidatesByTripId, [tripId]: next } };
        }),
      removeCandidatePlace: (tripId, placeId) =>
        set((state) => {
          if (!state.tripsById[tripId]) return state;
          return {
            candidatesByTripId: {
              ...state.candidatesByTripId,
              [tripId]: (state.candidatesByTripId[tripId] ?? []).filter((candidate) => candidate.placeId !== placeId),
            },
          };
        }),
      addPlaceToItinerary: (input) =>
        set((state) => {
          const trip = state.tripsById[input.tripId];
          const place = state.placesById[input.placeId];
          if (!trip || !place) return state;
          const current = state.itineraryByTripId[input.tripId] ?? [];
          if (current.some((item) => item.placeId === input.placeId)) return state;
          const candidate = (state.candidatesByTripId[input.tripId] ?? []).find((item) => item.placeId === input.placeId);
          const nextItem: ItineraryItem = {
            id: createItineraryId(state, input.tripId, input.placeId, input.date),
            tripId: input.tripId,
            placeId: input.placeId,
            date: input.date,
            startTime: input.startTime ?? "20:30",
            durationMinutes: input.durationMinutes ?? defaultDurationForCategory(place.category),
            itemType: "place",
            preferredByUserIds: input.preferredByUserIds ?? candidate?.addedByUserIds ?? [state.currentUserId],
          };
          return {
            itineraryByTripId: {
              ...state.itineraryByTripId,
              [input.tripId]: [...current, nextItem],
            },
          };
        }),
      removeItineraryItem: (tripId, itineraryItemId) =>
        set((state) => {
          if (!state.tripsById[tripId]) return state;
          return {
            itineraryByTripId: {
              ...state.itineraryByTripId,
              [tripId]: (state.itineraryByTripId[tripId] ?? []).filter((item) => item.id !== itineraryItemId),
            },
          };
        }),
      updateItineraryItem: (tripId, itineraryItemId, patch) =>
        set((state) => {
          if (!state.tripsById[tripId]) return state;
          return {
            itineraryByTripId: {
              ...state.itineraryByTripId,
              [tripId]: (state.itineraryByTripId[tripId] ?? []).map((item) =>
                item.id === itineraryItemId ? { ...item, ...patch } : item,
              ),
            },
          };
        }),
      resetDemoData: () => set(createDemoData()),
    }),
    {
      name: "duri-mvp-store",
      version: 1,
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        currentUserId: state.currentUserId,
        activeTripId: state.activeTripId,
        usersById: state.usersById,
        regionsById: state.regionsById,
        placesById: state.placesById,
        tripsById: state.tripsById,
        tripOrder: state.tripOrder,
        candidatesByTripId: state.candidatesByTripId,
        itineraryByTripId: state.itineraryByTripId,
        preferenceResultsByUserId: state.preferenceResultsByUserId,
        analysesByTripId: state.analysesByTripId,
        savedPlaceIdsByUserId: state.savedPlaceIdsByUserId,
      }),
    },
  ),
);
