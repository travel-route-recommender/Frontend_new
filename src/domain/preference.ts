import type { EntityId, ISODateString } from "./user";

export type UserPreferenceResult = {
  userId: EntityId;
  profileType: string;
  traits: string[];
  completedAt?: ISODateString;
};
