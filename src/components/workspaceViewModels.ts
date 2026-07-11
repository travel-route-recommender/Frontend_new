import type { ItineraryItem, Place, TripCandidate, User } from "../domain";

export type CandidateView = {
  candidate: TripCandidate;
  place: Place;
  addedByUsers: User[];
};

export type ItineraryView = {
  item: ItineraryItem;
  place?: Place;
  preferredByUsers: User[];
};
