import type {
  EntityId,
  ItineraryItem,
  ItineraryItemType,
} from "../../domain";
import type { DuriAnalysisInput, DuriAnalysisResult } from "../duri-analysis";

export type DuriSuggestionType =
  | "reorder-route"
  | "move-item"
  | "insert-rest"
  | "insert-meal"
  | "add-preference-place"
  | "remove-overload-item"
  | "replace-place";

export type SuggestionPriority = "low" | "medium" | "high";

export type SuggestionApplyStatus =
  | "applied"
  | "stale"
  | "conflict"
  | "invalid"
  | "not-applicable";

export type ScheduleChangeState = {
  date?: string;
  startTime?: string;
  durationMinutes?: number;
  placeId?: EntityId;
  itemType?: ItineraryItemType;
  preferredByUserIds?: EntityId[];
  note?: string;
};

export interface ScheduleChangePreview {
  itemId?: EntityId;
  placeId?: EntityId;
  action: "add" | "remove" | "move" | "resize" | "replace";
  before?: ScheduleChangeState;
  after?: ScheduleChangeState;
}

export interface DuriSuggestion {
  id: string;
  tripId: EntityId;
  sourceIssueIds: string[];
  type: DuriSuggestionType;
  priority: SuggestionPriority;
  title: string;
  summary: string;
  reason: string;
  affectedItemIds: EntityId[];
  affectedPlaceIds: EntityId[];
  changes: ScheduleChangePreview[];
  canApply: boolean;
  unavailableReason?: string;
  itineraryFingerprint: string;
}

export type DuriSuggestionInput = DuriAnalysisInput & {
  analysis: DuriAnalysisResult;
};

export type SuggestionChangeContext = {
  tripId: EntityId;
  tripDates: string[];
  placesById: DuriAnalysisInput["placesById"];
  candidates: DuriAnalysisInput["candidates"];
};

export type SuggestionChangeResult =
  | { status: "applied"; itinerary: ItineraryItem[] }
  | { status: Exclude<SuggestionApplyStatus, "applied" | "stale"> };

