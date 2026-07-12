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
import { DEFAULT_PLACE_DURATION_MINUTES } from "../data/workspaceSchedule";
import { isValidISODate } from "../utils/formatters";
import { createUniqueEntityId } from "../utils/ids";
import {
  findOverlappingItem,
  getTripDates,
  isValidScheduleRange,
  sortItineraryItemsByDateAndTime,
} from "../utils/schedule";

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

export type AddCandidatePlaceResult =
  | "added"
  | "already-exists"
  | "invalid-trip"
  | "invalid-place"
  | "trip-not-editable"
  | "not-member";

export type ItineraryMutationResult =
  | "success"
  | "invalid-trip"
  | "trip-not-editable"
  | "not-member"
  | "invalid-item"
  | "invalid-place"
  | "duplicate-place"
  | "invalid-date"
  | "invalid-time"
  | "overlap";

type DuriActions = {
  createTrip: (input: CreateTripInput) => EntityId;
  setActiveTrip: (tripId: EntityId) => void;
  toggleSavedPlace: (placeId: EntityId, userId?: EntityId) => void;
  addCandidatePlace: (tripId: EntityId, placeId: EntityId, addedByUserId?: EntityId) => AddCandidatePlaceResult;
  removeCandidatePlace: (tripId: EntityId, placeId: EntityId) => void;
  addPlaceToItinerary: (input: AddPlaceToItineraryInput) => ItineraryMutationResult;
  removeItineraryItem: (tripId: EntityId, itineraryItemId: EntityId) => ItineraryMutationResult;
  updateItineraryItem: (
    tripId: EntityId,
    itineraryItemId: EntityId,
    patch: Partial<Omit<ItineraryItem, "id" | "tripId">>,
  ) => ItineraryMutationResult;
  resetDemoData: () => void;
};

export type DuriState = DuriDomainState & DuriActions;

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
      addCandidatePlace: (tripId, placeId, addedByUserId) => {
        let result: AddCandidatePlaceResult = "invalid-trip";

        set((state) => {
          const trip = state.tripsById[tripId];
          const targetUserId = addedByUserId ?? state.currentUserId;
          if (!trip) return state;
          if (!state.placesById[placeId]) {
            result = "invalid-place";
            return state;
          }
          if (trip.status === "completed") {
            result = "trip-not-editable";
            return state;
          }
          const currentUserIsMember = trip.members.some((member) => member.userId === state.currentUserId);
          const targetUserIsMember = trip.members.some((member) => member.userId === targetUserId);
          if (!currentUserIsMember || !targetUserIsMember) {
            result = "not-member";
            return state;
          }

          const current = state.candidatesByTripId[tripId] ?? [];
          const existing = current.find((candidate) => candidate.placeId === placeId);
          if (existing?.addedByUserIds.includes(targetUserId)) {
            result = "already-exists";
            return state;
          }

          result = "added";
          const next = existing
            ? current.map((candidate) =>
                candidate.placeId === placeId
                  ? { ...candidate, addedByUserIds: [...candidate.addedByUserIds, targetUserId] }
                  : candidate,
              )
            : [
                ...current,
                {
                  tripId,
                  placeId,
                  addedByUserIds: [targetUserId],
                  recommendedByDuri: false,
                  addedAt: new Date().toISOString().slice(0, 10),
                },
              ];
          return { candidatesByTripId: { ...state.candidatesByTripId, [tripId]: next } };
        });

        return result;
      },
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
      addPlaceToItinerary: (input) => {
        let result: ItineraryMutationResult = "invalid-trip";

        set((state) => {
          const trip = state.tripsById[input.tripId];
          const place = state.placesById[input.placeId];
          if (!trip) return state;
          if (trip.status === "completed") {
            result = "trip-not-editable";
            return state;
          }
          if (!trip.members.some((member) => member.userId === state.currentUserId)) {
            result = "not-member";
            return state;
          }
          if (!place) {
            result = "invalid-place";
            return state;
          }
          if (!getTripDates(trip.startDate, trip.endDate).includes(input.date)) {
            result = "invalid-date";
            return state;
          }

          const current = state.itineraryByTripId[input.tripId] ?? [];
          if (current.some((item) => item.placeId === input.placeId)) {
            result = "duplicate-place";
            return state;
          }
          const candidate = (state.candidatesByTripId[input.tripId] ?? []).find((item) => item.placeId === input.placeId);
          const nextItem: ItineraryItem = {
            id: createItineraryId(state, input.tripId, input.placeId, input.date),
            tripId: input.tripId,
            placeId: input.placeId,
            date: input.date,
            startTime: input.startTime ?? "08:00",
            durationMinutes: input.durationMinutes ?? DEFAULT_PLACE_DURATION_MINUTES,
            itemType: "place",
            preferredByUserIds: input.preferredByUserIds ?? candidate?.addedByUserIds ?? [state.currentUserId],
          };
          if (!isValidScheduleRange(nextItem)) {
            result = "invalid-time";
            return state;
          }
          if (findOverlappingItem(current, nextItem)) {
            result = "overlap";
            return state;
          }

          result = "success";
          return {
            itineraryByTripId: {
              ...state.itineraryByTripId,
              [input.tripId]: sortItineraryItemsByDateAndTime([...current, nextItem]),
            },
          };
        });

        return result;
      },
      removeItineraryItem: (tripId, itineraryItemId) => {
        let result: ItineraryMutationResult = "invalid-trip";

        set((state) => {
          const trip = state.tripsById[tripId];
          if (!trip) return state;
          if (trip.status === "completed") {
            result = "trip-not-editable";
            return state;
          }
          if (!trip.members.some((member) => member.userId === state.currentUserId)) {
            result = "not-member";
            return state;
          }
          const current = state.itineraryByTripId[tripId] ?? [];
          if (!current.some((item) => item.id === itineraryItemId)) {
            result = "invalid-item";
            return state;
          }
          result = "success";
          return {
            itineraryByTripId: {
              ...state.itineraryByTripId,
              [tripId]: current.filter((item) => item.id !== itineraryItemId),
            },
          };
        });

        return result;
      },
      updateItineraryItem: (tripId, itineraryItemId, patch) => {
        let result: ItineraryMutationResult = "invalid-trip";

        set((state) => {
          const trip = state.tripsById[tripId];
          if (!trip) return state;
          if (trip.status === "completed") {
            result = "trip-not-editable";
            return state;
          }
          if (!trip.members.some((member) => member.userId === state.currentUserId)) {
            result = "not-member";
            return state;
          }
          const current = state.itineraryByTripId[tripId] ?? [];
          const item = current.find((entry) => entry.id === itineraryItemId);
          if (!item) {
            result = "invalid-item";
            return state;
          }
          const nextItem = { ...item, ...patch };
          if (nextItem.placeId && !state.placesById[nextItem.placeId]) {
            result = "invalid-place";
            return state;
          }
          if (!getTripDates(trip.startDate, trip.endDate).includes(nextItem.date)) {
            result = "invalid-date";
            return state;
          }
          if (!isValidScheduleRange(nextItem)) {
            result = "invalid-time";
            return state;
          }
          if (nextItem.placeId && current.some((entry) => entry.id !== itineraryItemId && entry.placeId === nextItem.placeId)) {
            result = "duplicate-place";
            return state;
          }
          if (findOverlappingItem(current, nextItem, itineraryItemId)) {
            result = "overlap";
            return state;
          }
          result = "success";
          return {
            itineraryByTripId: {
              ...state.itineraryByTripId,
              [tripId]: sortItineraryItemsByDateAndTime(
                current.map((entry) => (entry.id === itineraryItemId ? nextItem : entry)),
              ),
            },
          };
        });

        return result;
      },
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
        savedPlaceIdsByUserId: state.savedPlaceIdsByUserId,
      }),
    },
  ),
);
