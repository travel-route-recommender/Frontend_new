import type { EntityId, ISODateString } from "./user";

export type TripStatus = "drafting" | "confirmed" | "completed";
export type TripMemberRole = "owner" | "member";
export type PreferenceResponseStatus = "pending" | "completed";

export type TripMember = {
  userId: EntityId;
  role: TripMemberRole;
  preferenceStatus: PreferenceResponseStatus;
};

export type TripRoom = {
  id: EntityId;
  title: string;
  regionId: EntityId;
  startDate: ISODateString;
  endDate: ISODateString;
  status: TripStatus;
  members: TripMember[];
};

export type TripCandidate = {
  tripId: EntityId;
  placeId: EntityId;
  addedByUserIds: EntityId[];
  recommendedByDuri: boolean;
  addedAt?: ISODateString;
};
