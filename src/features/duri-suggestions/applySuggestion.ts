import type { ItineraryItem } from "../../domain";
import {
  findOverlappingItem,
  isValidScheduleRange,
  sortItineraryItemsByDateAndTime,
} from "../../utils/schedule";
import { buildItineraryFingerprint, generateSuggestionId } from "./fingerprint";
import type {
  DuriSuggestion,
  ScheduleChangePreview,
  ScheduleChangeState,
  SuggestionChangeContext,
  SuggestionChangeResult,
} from "./types";

function stateMatches(item: ItineraryItem, expected?: ScheduleChangeState) {
  if (!expected) return true;
  return (
    (expected.date === undefined || expected.date === item.date) &&
    (expected.startTime === undefined || expected.startTime === item.startTime) &&
    (expected.durationMinutes === undefined || expected.durationMinutes === item.durationMinutes) &&
    (expected.placeId === undefined || expected.placeId === item.placeId) &&
    (expected.itemType === undefined || expected.itemType === item.itemType)
  );
}

function validateFinalItinerary(
  itinerary: ItineraryItem[],
  context: SuggestionChangeContext,
): SuggestionChangeResult["status"] {
  const ids = new Set<string>();
  const placeIds = new Set<string>();
  for (const item of itinerary) {
    if (item.tripId !== context.tripId || ids.has(item.id)) return "invalid";
    ids.add(item.id);
    if (!context.tripDates.includes(item.date) || !isValidScheduleRange(item)) return "invalid";
    if (item.placeId) {
      if (!context.placesById[item.placeId]) return "invalid";
      if (placeIds.has(item.placeId)) return "invalid";
      placeIds.add(item.placeId);
    }
    if (findOverlappingItem(itinerary, item, item.id)) return "conflict";
  }
  return "applied";
}

export function applySuggestionChanges(
  itinerary: ItineraryItem[],
  suggestion: DuriSuggestion,
  context: SuggestionChangeContext,
): SuggestionChangeResult {
  if (!suggestion.canApply || !suggestion.changes.length || suggestion.tripId !== context.tripId) {
    return { status: "not-applicable" };
  }

  const candidatePlaceIds = new Set(context.candidates.map((candidate) => candidate.placeId));
  let next = itinerary.map((item) => ({ ...item, preferredByUserIds: [...item.preferredByUserIds] }));

  for (const change of suggestion.changes) {
    if (change.action === "add") {
      const after = change.after;
      if (!change.itemId || !after?.date || !after.startTime || !after.durationMinutes || !after.itemType) {
        return { status: "invalid" };
      }
      if (next.some((item) => item.id === change.itemId)) return { status: "invalid" };
      if (
        after.placeId &&
        ["insert-meal", "add-preference-place"].includes(suggestion.type) &&
        !candidatePlaceIds.has(after.placeId)
      ) {
        return { status: "not-applicable" };
      }
      next.push({
        id: change.itemId,
        tripId: context.tripId,
        placeId: after.placeId,
        date: after.date,
        startTime: after.startTime,
        durationMinutes: after.durationMinutes,
        itemType: after.itemType,
        preferredByUserIds: [...(after.preferredByUserIds ?? [])],
        note: after.note,
      });
      continue;
    }

    if (!change.itemId) return { status: "invalid" };
    const index = next.findIndex((item) => item.id === change.itemId);
    if (index < 0 || !stateMatches(next[index], change.before)) return { status: "not-applicable" };
    if (change.action === "remove") {
      next = next.filter((item) => item.id !== change.itemId);
      continue;
    }
    const after = change.after;
    if (!after) return { status: "invalid" };
    if (
      change.action === "replace" &&
      after.placeId &&
      !candidatePlaceIds.has(after.placeId)
    ) {
      return { status: "not-applicable" };
    }
    next[index] = {
      ...next[index],
      ...(after.date !== undefined ? { date: after.date } : {}),
      ...(after.startTime !== undefined ? { startTime: after.startTime } : {}),
      ...(after.durationMinutes !== undefined ? { durationMinutes: after.durationMinutes } : {}),
      ...(after.placeId !== undefined ? { placeId: after.placeId } : {}),
      ...(after.itemType !== undefined ? { itemType: after.itemType } : {}),
      ...(after.preferredByUserIds !== undefined
        ? { preferredByUserIds: [...after.preferredByUserIds] }
        : {}),
      ...(after.note !== undefined ? { note: after.note } : {}),
    };
  }

  const status = validateFinalItinerary(next, context);
  return status === "applied"
    ? { status, itinerary: sortItineraryItemsByDateAndTime(next) }
    : { status };
}

export function validateSuggestion(
  itinerary: ItineraryItem[],
  suggestion: DuriSuggestion,
  context: SuggestionChangeContext,
) {
  if (buildItineraryFingerprint(itinerary) !== suggestion.itineraryFingerprint) return "stale" as const;
  return applySuggestionChanges(itinerary, suggestion, context).status;
}

export function previewSuggestion(
  itinerary: ItineraryItem[],
  suggestion: DuriSuggestion,
  context: SuggestionChangeContext,
) {
  return applySuggestionChanges(itinerary, suggestion, context);
}

export function createInverseChanges(
  suggestion: DuriSuggestion,
  beforeItinerary: ItineraryItem[],
  afterItinerary: ItineraryItem[],
): DuriSuggestion {
  const beforeById = new Map(beforeItinerary.map((item) => [item.id, item]));
  const afterById = new Map(afterItinerary.map((item) => [item.id, item]));
  const toState = (item: ItineraryItem): ScheduleChangeState => ({
    date: item.date,
    startTime: item.startTime,
    durationMinutes: item.durationMinutes,
    placeId: item.placeId,
    itemType: item.itemType,
    preferredByUserIds: [...item.preferredByUserIds],
    note: item.note,
  });
  const changes: ScheduleChangePreview[] = [];
  for (const change of [...suggestion.changes].reverse()) {
    if (!change.itemId) continue;
    const before = beforeById.get(change.itemId);
    const after = afterById.get(change.itemId);
    if (change.action === "add" && after) {
      changes.push({ itemId: change.itemId, placeId: after.placeId, action: "remove", before: toState(after) });
      continue;
    }
    if (change.action === "remove" && before) {
      changes.push({ itemId: change.itemId, placeId: before.placeId, action: "add", after: toState(before) });
      continue;
    }
    if (before && after) {
      changes.push({
        itemId: change.itemId,
        placeId: before.placeId,
        action: change.action,
        before: toState(after),
        after: toState(before),
      });
    }
  }
  const itineraryFingerprint = buildItineraryFingerprint(afterItinerary);
  const base = {
    tripId: suggestion.tripId,
    sourceIssueIds: suggestion.sourceIssueIds,
    type: suggestion.type,
    priority: suggestion.priority,
    title: `${suggestion.title} 실행 취소`,
    summary: "마지막 제안 적용 전 일정으로 되돌려요.",
    reason: "현재 화면에서 마지막으로 적용한 두리 제안만 되돌립니다.",
    affectedItemIds: changes.flatMap((change) => (change.itemId ? [change.itemId] : [])),
    affectedPlaceIds: [...new Set(changes.flatMap((change) => {
      const placeId = change.after?.placeId ?? change.before?.placeId;
      return placeId ? [placeId] : [];
    }))],
    changes,
    canApply: changes.length > 0,
    itineraryFingerprint,
  } satisfies Omit<DuriSuggestion, "id">;
  return { ...base, id: generateSuggestionId(base) };
}
