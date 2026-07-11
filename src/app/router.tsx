import { Route, Routes } from "react-router-dom";
import { DuriExploreListPage } from "../components/DuriExploreListPage";
import { DuriExploreMapPage } from "../components/DuriExploreMapPage";
import { DuriHomePage } from "../components/DuriHomePage";
import { AppShell } from "./AppShell";
import { DuriPage, MyPage, SavedPage, TripsPage, TripWorkspaceRoute } from "../pages/MainTabPages";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PlaceDetailRoute } from "../pages/PlaceDetailRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DuriHomePage />} />
        <Route path="explore" element={<DuriExploreListPage />} />
        <Route path="explore/map" element={<DuriExploreMapPage />} />
        <Route path="places/:placeId" element={<PlaceDetailRoute />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="duri" element={<DuriPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="mypage" element={<MyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="trips/:tripId/workspace" element={<TripWorkspaceRoute />} />
    </Routes>
  );
}
