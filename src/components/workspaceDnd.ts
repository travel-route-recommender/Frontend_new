export type WorkspaceDragData =
  | { kind: "candidate"; placeId: string; name: string }
  | { kind: "itinerary"; itemId: string; name: string };

export type WorkspaceDropData = {
  kind: "slot";
  date: string;
  startTime: string;
};
