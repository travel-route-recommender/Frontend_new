import { DEFAULT_PLACE_DURATION_MINUTES } from "../../data/workspaceSchedule";
import type { EntityId, ItineraryItem, Place, TripCandidate } from "../../domain";
import { DURI_ANALYSIS_CONFIG, extractStableArea, isMealPlace } from "../duri-analysis";
import { normalizeTrait } from "../duri-analysis/shared";
import type { AnalysisIssue } from "../duri-analysis";
import {
  findNextAvailableSlot,
  findOverlappingItem,
  getTripDates,
  minutesToTimeString,
  sortItineraryItemsByDateAndTime,
  timeStringToMinutes,
} from "../../utils/schedule";
import { buildPreviewItinerary } from "./applySuggestion";
import { buildItineraryFingerprint, generateSuggestionId } from "./fingerprint";
import type {
  DuriSuggestion,
  DuriSuggestionInput,
  DuriSuggestionType,
  ScheduleChangePreview,
  SuggestionPriority,
} from "./types";

const actionPriority: Record<DuriSuggestionType, number> = {
  "insert-meal": 0,
  "insert-rest": 1,
  "move-item": 2,
  "remove-overload-item": 3,
  "reorder-route": 4,
  "add-preference-place": 5,
  "replace-place": 6,
};

function itemState(item: ItineraryItem) {
  return {
    date: item.date,
    startTime: item.startTime,
    durationMinutes: item.durationMinutes,
    placeId: item.placeId,
    itemType: item.itemType,
    preferredByUserIds: [...item.preferredByUserIds],
    note: item.note,
  };
}

function createAddedItemId(
  type: DuriSuggestionType,
  date: string,
  startTime: string,
  placeId: string | undefined,
  existingIds: Set<string>,
) {
  const base = `duri-${type}-${date}-${startTime.replace(":", "")}-${placeId ?? "block"}`;
  let id = base;
  let sequence = 2;
  while (existingIds.has(id)) {
    id = `${base}-${sequence}`;
    sequence += 1;
  }
  return id;
}

function createSuggestion(
  input: DuriSuggestionInput,
  values: Omit<DuriSuggestion, "id" | "tripId" | "itineraryFingerprint" | "canApply"> & {
    canApply?: boolean;
  },
): DuriSuggestion {
  const itineraryFingerprint = buildItineraryFingerprint(input.itinerary);
  const draft = {
    tripId: input.trip.id,
    itineraryFingerprint,
    ...values,
    canApply: values.canApply ?? values.changes.length > 0,
  };
  const id = generateSuggestionId(draft);
  if (!draft.canApply) return { ...draft, id };
  const result = buildPreviewItinerary(input.itinerary, { ...draft, id }, {
    tripId: input.trip.id,
    tripDates: getTripDates(input.trip.startDate, input.trip.endDate),
    placesById: input.placesById,
    candidates: input.candidates,
  });
  if (result.status === "ready") return { ...draft, id };
  return {
    ...draft,
    id,
    canApply: false,
    unavailableReason: result.status === "conflict"
      ? "현재 일정과 겹쳐 바로 적용할 수 없어요."
      : "일정이나 후보 장소가 달라져 다시 계산이 필요해요.",
  };
}

function issuePriority(issue: AnalysisIssue): SuggestionPriority {
  if (issue.severity === "high") return "high";
  if (issue.severity === "medium") return "medium";
  return "low";
}

function transitionCount(areas: string[]) {
  return areas.slice(1).filter((area, index) => area !== areas[index]).length;
}

export function buildRouteReorderSuggestion(
  input: DuriSuggestionInput,
  issue: AnalysisIssue,
): DuriSuggestion | undefined {
  if (!issue.date || issue.severity === "info") return undefined;
  const entries = sortItineraryItemsByDateAndTime(input.itinerary)
    .filter((item) => item.date === issue.date && item.placeId && input.placesById[item.placeId])
    .map((item) => ({ item, area: extractStableArea(input.placesById[item.placeId as string].address) }))
    .filter((entry): entry is { item: ItineraryItem; area: string } => Boolean(entry.area));
  if (entries.length < 3) return undefined;
  const baseScore = transitionCount(entries.map((entry) => entry.area));
  let best: { left: ItineraryItem; right: ItineraryItem; score: number } | undefined;

  for (let index = 0; index < entries.length - 1; index += 1) {
    const reordered = [...entries];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    const score = transitionCount(reordered.map((entry) => entry.area));
    if (score < baseScore && (!best || score < best.score)) {
      best = { left: entries[index].item, right: entries[index + 1].item, score };
    }
  }
  if (!best) return undefined;
  const leftPlace = best.left.placeId ? input.placesById[best.left.placeId] : undefined;
  const rightPlace = best.right.placeId ? input.placesById[best.right.placeId] : undefined;
  const changes: ScheduleChangePreview[] = [
    {
      itemId: best.left.id,
      placeId: best.left.placeId,
      action: "move",
      before: itemState(best.left),
      after: { ...itemState(best.left), startTime: best.right.startTime },
    },
    {
      itemId: best.right.id,
      placeId: best.right.placeId,
      action: "move",
      before: itemState(best.right),
      after: { ...itemState(best.right), startTime: best.left.startTime },
    },
  ];
  return createSuggestion(input, {
    sourceIssueIds: [issue.id],
    type: "reorder-route",
    priority: issuePriority(issue),
    title: `${leftPlace?.name ?? "두 장소"}와 ${rightPlace?.name ?? "다음 장소"} 순서 바꾸기`,
    summary: "인접한 두 일정의 시간만 교환해 같은 권역을 다시 오가는 흐름을 줄여요.",
    reason: `${issue.title} · 권역 전환을 ${baseScore}회에서 ${best.score}회로 줄일 수 있어요.`,
    affectedItemIds: [best.left.id, best.right.id],
    affectedPlaceIds: [best.left.placeId, best.right.placeId].filter((id): id is string => Boolean(id)),
    changes,
  });
}

function mealWindowForIssue(issue: AnalysisIssue) {
  const label = issue.evidence.find((entry) => entry.label === "누락 식사")?.value;
  return [DURI_ANALYSIS_CONFIG.meal.breakfast, DURI_ANALYSIS_CONFIG.meal.lunch, DURI_ANALYSIS_CONFIG.meal.dinner]
    .find((window) => window.label === label);
}

export function findMealSlot(itinerary: ItineraryItem[], date: string, issue: AnalysisIssue) {
  const window = mealWindowForIssue(issue);
  if (!window) return undefined;
  const durationMinutes = 60;
  for (let minutes = window.start; minutes + durationMinutes <= window.end; minutes += 30) {
    const startTime = minutesToTimeString(minutes);
    if (!findOverlappingItem(itinerary, { date, startTime, durationMinutes })) {
      return { startTime, durationMinutes, label: window.label };
    }
  }
  return undefined;
}

function buildMealSuggestion(input: DuriSuggestionInput, issue: AnalysisIssue): DuriSuggestion | undefined {
  if (!issue.date || issue.severity === "info") return undefined;
  const slot = findMealSlot(input.itinerary, issue.date, issue);
  if (!slot) {
    return createSuggestion(input, {
      sourceIssueIds: [issue.id],
      type: "insert-meal",
      priority: issuePriority(issue),
      title: `${mealWindowForIssue(issue)?.label ?? "식사"} 시간을 추가해볼까요?`,
      summary: "현재 식사 시간대에는 충돌 없는 60분 슬롯이 없어요.",
      reason: issue.summary,
      affectedItemIds: issue.affectedItemIds,
      affectedPlaceIds: issue.affectedPlaceIds,
      changes: [],
      canApply: false,
      unavailableReason: "현재 일정에는 식사 시간을 넣을 수 있는 빈 시간이 부족해요.",
    });
  }
  const scheduledPlaceIds = new Set(input.itinerary.flatMap((item) => item.placeId ? [item.placeId] : []));
  const mealCandidate = [...input.candidates]
    .filter((candidate) => !scheduledPlaceIds.has(candidate.placeId) && Boolean(input.placesById[candidate.placeId]) && isMealPlace(input.placesById[candidate.placeId]))
    .sort((left, right) => left.placeId.localeCompare(right.placeId))[0];
  const place = mealCandidate ? input.placesById[mealCandidate.placeId] : undefined;
  const existingIds = new Set(input.itinerary.map((item) => item.id));
  const itemId = createAddedItemId("insert-meal", issue.date, slot.startTime, place?.id, existingIds);
  const after = {
    date: issue.date,
    startTime: slot.startTime,
    durationMinutes: slot.durationMinutes,
    placeId: place?.id,
    itemType: place ? "place" as const : "meal" as const,
    preferredByUserIds: mealCandidate?.addedByUserIds ?? [],
    note: `${slot.label} 식사 시간`,
  };
  return createSuggestion(input, {
    sourceIssueIds: [issue.id],
    type: "insert-meal",
    priority: issuePriority(issue),
    title: place ? `${place.name}에서 ${slot.label} 일정 추가` : `${slot.label} 식사 시간 추가`,
    summary: place ? `여행방 후보 장소를 ${slot.startTime} 빈 시간에 반영해요.` : `장소를 정하지 않고 ${slot.startTime}부터 60분을 식사 시간으로 비워둬요.`,
    reason: issue.summary,
    affectedItemIds: [itemId],
    affectedPlaceIds: place ? [place.id] : [],
    changes: [{ itemId, placeId: place?.id, action: "add", after }],
  });
}

export function findRestSlot(itinerary: ItineraryItem[], date: string) {
  const items = sortItineraryItemsByDateAndTime(itinerary.filter((item) => item.date === date));
  if (items.length < 2) return undefined;
  const firstStart = timeStringToMinutes(items[0].startTime);
  const lastEnd = Math.max(...items.map((item) => timeStringToMinutes(item.startTime) + item.durationMinutes));
  for (const durationMinutes of [60, 30]) {
    for (let minutes = firstStart + 30; minutes + durationMinutes <= lastEnd; minutes += 30) {
      const startTime = minutesToTimeString(minutes);
      if (!findOverlappingItem(items, { date, startTime, durationMinutes })) return { startTime, durationMinutes };
    }
  }
  return undefined;
}

function duplicateCharacterScore(item: ItineraryItem, dayItems: ItineraryItem[], placesById: Record<string, Place>) {
  if (!item.placeId || !placesById[item.placeId]) return 0;
  const place = placesById[item.placeId];
  const terms = new Set([place.category, ...place.tags].map(normalizeTrait));
  return dayItems.filter((other) => {
    if (other.id === item.id || !other.placeId || !placesById[other.placeId]) return false;
    const otherTerms = [placesById[other.placeId].category, ...placesById[other.placeId].tags].map(normalizeTrait);
    return otherTerms.some((term) => terms.has(term));
  }).length;
}

function buildDensitySuggestions(input: DuriSuggestionInput, issue: AnalysisIssue) {
  if (!issue.date || issue.severity === "info") return [];
  const dayItems = sortItineraryItemsByDateAndTime(input.itinerary.filter((item) => item.date === issue.date));
  if (dayItems.length < 2) return [];
  const suggestions: DuriSuggestion[] = [];
  const last = dayItems[dayItems.length - 1];
  const currentEnd = timeStringToMinutes(last.startTime) + last.durationMinutes;
  const movedStart = findNextAvailableSlot({
    items: input.itinerary,
    date: issue.date,
    durationMinutes: last.durationMinutes,
    fromMinutes: currentEnd + 60,
    excludeItemId: last.id,
  });
  if (movedStart && movedStart !== last.startTime) {
    suggestions.push(createSuggestion(input, {
      sourceIssueIds: [issue.id],
      type: "move-item",
      priority: issuePriority(issue),
      title: "마지막 일정을 옮겨 휴식 간격 확보",
      summary: `${last.startTime} 일정을 ${movedStart}로 옮겨 앞 일정과 1시간 이상 간격을 만들어요.`,
      reason: issue.summary,
      affectedItemIds: [last.id],
      affectedPlaceIds: last.placeId ? [last.placeId] : [],
      changes: [{ itemId: last.id, placeId: last.placeId, action: "move", before: itemState(last), after: { ...itemState(last), startTime: movedStart } }],
    }));
  }

  const restSlot = findRestSlot(input.itinerary, issue.date);
  if (restSlot) {
    const itemId = createAddedItemId("insert-rest", issue.date, restSlot.startTime, undefined, new Set(input.itinerary.map((item) => item.id)));
    suggestions.push(createSuggestion(input, {
      sourceIssueIds: [issue.id],
      type: "insert-rest",
      priority: issuePriority(issue),
      title: `일정 사이에 ${restSlot.durationMinutes}분 휴식 추가`,
      summary: `${restSlot.startTime}부터 비어 있는 시간을 휴식 블록으로 남겨 연속 활동을 나눠요.`,
      reason: issue.summary,
      affectedItemIds: [itemId],
      affectedPlaceIds: [],
      changes: [{ itemId, action: "add", after: { date: issue.date, startTime: restSlot.startTime, durationMinutes: restSlot.durationMinutes, itemType: "rest", preferredByUserIds: [], note: "휴식 시간" } }],
    }));
  }

  if (!suggestions.length && issue.severity === "high") {
    const candidatesByPlaceId = new Map(input.candidates.map((candidate) => [candidate.placeId, candidate]));
    const removable = dayItems
      .filter((item) => item.placeId && candidatesByPlaceId.has(item.placeId))
      .map((item) => ({
        item,
        candidate: candidatesByPlaceId.get(item.placeId as string) as TripCandidate,
        duplicateScore: duplicateCharacterScore(item, dayItems, input.placesById),
      }))
      .filter((entry) => !entry.candidate.recommendedByDuri && entry.duplicateScore > 0)
      .sort((left, right) =>
        left.item.preferredByUserIds.length - right.item.preferredByUserIds.length ||
        right.duplicateScore - left.duplicateScore ||
        left.item.id.localeCompare(right.item.id),
      )[0];
    if (removable) {
      const place = removable.item.placeId ? input.placesById[removable.item.placeId] : undefined;
      suggestions.push(createSuggestion(input, {
        sourceIssueIds: [issue.id],
        type: "remove-overload-item",
        priority: "high",
        title: `${place?.name ?? "중복 성격 일정"}을 시간표에서 잠시 제외`,
        summary: "후보 장소는 유지하고, 선호 근거가 적고 성격이 겹치는 일정 하나만 시간표에서 빼요.",
        reason: `${issue.summary} 비슷한 태그의 다른 일정이 ${removable.duplicateScore}개 있어요.`,
        affectedItemIds: [removable.item.id],
        affectedPlaceIds: removable.item.placeId ? [removable.item.placeId] : [],
        changes: [{ itemId: removable.item.id, placeId: removable.item.placeId, action: "remove", before: itemState(removable.item) }],
      }));
    }
  }
  return suggestions.slice(0, 2);
}

function placeMatchesMemberTraits(place: Place, memberId: EntityId, input: DuriSuggestionInput) {
  const terms = [place.category, ...place.tags].map(normalizeTrait);
  return (input.preferenceResults[memberId]?.traits ?? []).some((trait) => {
    const normalized = normalizeTrait(trait);
    return terms.some((term) => term.includes(normalized) || normalized.includes(term));
  });
}

function findPreferenceCandidates(input: DuriSuggestionInput, memberId: EntityId) {
  const scheduledPlaceIds = new Set(input.itinerary.flatMap((item) => item.placeId ? [item.placeId] : []));
  return [...input.candidates]
    .filter((candidate) => !scheduledPlaceIds.has(candidate.placeId) && input.placesById[candidate.placeId]?.regionId === input.trip.regionId)
    .map((candidate) => ({
      candidate,
      place: input.placesById[candidate.placeId],
      score: (candidate.addedByUserIds.includes(memberId) ? 4 : 0) + (placeMatchesMemberTraits(input.placesById[candidate.placeId], memberId, input) ? 2 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.place.id.localeCompare(right.place.id));
}

export function findPreferenceCandidate(input: DuriSuggestionInput, memberId: EntityId) {
  return findPreferenceCandidates(input, memberId)[0];
}

function buildPreferenceSuggestion(input: DuriSuggestionInput, issue: AnalysisIssue): DuriSuggestion | undefined {
  const memberId = issue.affectedMemberIds.length === 1 ? issue.affectedMemberIds[0] : undefined;
  if (!memberId || !input.trip.members.some((member) => member.userId === memberId) || issue.severity === "info") return undefined;
  const preferenceCandidates = findPreferenceCandidates(input, memberId);
  const selected = preferenceCandidates[0];
  if (!selected) return undefined;
  const memberName = input.members.find((member) => member.id === memberId)?.name ?? "참여자";
  const tripDates = getTripDates(input.trip.startDate, input.trip.endDate);
  const durationMinutes = DEFAULT_PLACE_DURATION_MINUTES;
  const slot = tripDates
    .map((date) => ({
      date,
      placeCount: input.itinerary.filter((item) => item.date === date && item.itemType === "place").length,
      startTime: findNextAvailableSlot({ items: input.itinerary, date, durationMinutes }),
    }))
    .filter((entry) => entry.placeCount < DURI_ANALYSIS_CONFIG.density.densePlaceCount && entry.startTime)
    .sort((left, right) => left.placeCount - right.placeCount || left.date.localeCompare(right.date))[0];
  if (slot?.startTime) {
    const itemId = createAddedItemId("add-preference-place", slot.date, slot.startTime, selected.place.id, new Set(input.itinerary.map((item) => item.id)));
    return createSuggestion(input, {
      sourceIssueIds: [issue.id],
      type: "add-preference-place",
      priority: issuePriority(issue),
      title: `${memberName}님이 선호한 ${selected.place.name} 추가`,
      summary: `${slot.date} ${slot.startTime} 빈 시간에 후보 장소를 반영할 수 있어요.`,
      reason: `${issue.title} 후보를 담은 사람과 성향 태그를 기준으로 골랐어요.`,
      affectedItemIds: [itemId],
      affectedPlaceIds: [selected.place.id],
      changes: [{ itemId, placeId: selected.place.id, action: "add", after: { date: slot.date, startTime: slot.startTime, durationMinutes, placeId: selected.place.id, itemType: "place", preferredByUserIds: [...new Set([...selected.candidate.addedByUserIds, memberId])] } }],
    });
  }

  const replacement = preferenceCandidates.flatMap((candidateEntry) => {
    const category = normalizeTrait(candidateEntry.place.category);
    const sameCategory = input.itinerary.filter((item) => item.placeId && input.placesById[item.placeId] && normalizeTrait(input.placesById[item.placeId].category) === category);
    const target = sameCategory.length >= 2
      ? sameCategory.find((item) => !item.preferredByUserIds.includes(memberId))
      : undefined;
    return target ? [{ selected: candidateEntry, target }] : [];
  })[0];
  if (!replacement) return undefined;
  const replacementSelected = replacement.selected;
  const replaceTarget = replacement.target;
  const previousPlace = replaceTarget.placeId ? input.placesById[replaceTarget.placeId] : undefined;
  return createSuggestion(input, {
    sourceIssueIds: [issue.id],
    type: "replace-place",
    priority: issuePriority(issue),
    title: `${previousPlace?.name ?? "기존 장소"} 대신 ${replacementSelected.place.name}`,
    summary: "날짜와 시간, 체류시간은 유지하고 같은 카테고리의 후보 장소로 바꿔요.",
    reason: `${memberName}님의 선호를 반영하면서 일정 밀도를 늘리지 않는 선택지예요.`,
    affectedItemIds: [replaceTarget.id],
    affectedPlaceIds: [replaceTarget.placeId, replacementSelected.place.id].filter((id): id is string => Boolean(id)),
    changes: [{ itemId: replaceTarget.id, placeId: replacementSelected.place.id, action: "replace", before: itemState(replaceTarget), after: { ...itemState(replaceTarget), placeId: replacementSelected.place.id, preferredByUserIds: [...new Set([...replacementSelected.candidate.addedByUserIds, memberId])] } }],
  });
}

function dedupeSuggestions(suggestions: DuriSuggestion[]) {
  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    const key = JSON.stringify(suggestion.changes);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function generateDuriSuggestions(input: DuriSuggestionInput): DuriSuggestion[] {
  const actionable = {
    meal: input.analysis.meal.issues.filter((issue) => issue.severity !== "info"),
    density: input.analysis.density.issues.filter((issue) => issue.severity !== "info"),
    route: input.analysis.route.issues.filter((issue) => issue.severity !== "info"),
    preference: input.analysis.preference.issues.filter((issue) => issue.severity !== "info"),
  };
  const suggestions = [
    ...actionable.meal.flatMap((issue) => buildMealSuggestion(input, issue) ?? []),
    ...actionable.density.flatMap((issue) => buildDensitySuggestions(input, issue)),
    ...actionable.route.flatMap((issue) => buildRouteReorderSuggestion(input, issue) ?? []),
    ...actionable.preference.flatMap((issue) => buildPreferenceSuggestion(input, issue) ?? []),
  ];
  const priorityRank: Record<SuggestionPriority, number> = { high: 0, medium: 1, low: 2 };
  return dedupeSuggestions(suggestions).sort((left, right) =>
    priorityRank[left.priority] - priorityRank[right.priority] ||
    actionPriority[left.type] - actionPriority[right.type] ||
    left.id.localeCompare(right.id),
  );
}
