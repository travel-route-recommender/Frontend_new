import type { ItineraryItem } from "../../domain";
import {
  findOverlappingItem,
  isValidScheduleRange,
  sortItineraryItemsByDateAndTime,
} from "../../utils/schedule";
import type {
  DuriSuggestion,
  ScheduleChangeState,
  SuggestionChangeContext,
  SuggestionChangeResult,
  SuggestionPreviewResult,
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
  return "ready";
}

export function buildPreviewItinerary(
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
  return status === "ready"
    ? { status, previewItinerary: sortItineraryItemsByDateAndTime(next) }
    : { status };
}

export function previewSuggestion(
  itinerary: ItineraryItem[],
  suggestion: DuriSuggestion,
  context: SuggestionChangeContext,
): SuggestionPreviewResult {
  const result = buildPreviewItinerary(itinerary, suggestion, context);
  if (result.status === "ready") return { success: true, previewItinerary: result.previewItinerary };
  const reason = result.status === "conflict"
    ? "변경 후 일정이 다른 일정과 겹쳐 미리보기를 만들 수 없어요."
    : result.status === "not-applicable"
      ? suggestion.unavailableReason ?? "현재 데이터로는 이 제안을 미리 볼 수 없어요."
      : "변경 대상 일정이나 장소 정보를 확인할 수 없어요.";
  return { success: false, reason };
}
