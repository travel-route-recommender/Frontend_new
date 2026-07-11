import { X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DuriExploreListPage } from "../components/DuriExploreListPage";
import { DuriPlaceDetailSheet } from "../components/DuriPlaceDetailSheet";
import { travelPlaces } from "../data/travelPages";

type PlaceRouteState = {
  fromDuri?: boolean;
};

export function PlaceDetailRoute() {
  const { placeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const place = travelPlaces.find((item) => item.id === placeId) ?? null;
  const routeState = location.state as PlaceRouteState | null;

  const closeSheet = () => {
    if (routeState?.fromDuri) {
      navigate(-1);
      return;
    }

    navigate("/explore");
  };

  return (
    <>
      <DuriExploreListPage />
      {place ? <DuriPlaceDetailSheet place={place} onClose={closeSheet} /> : <MissingPlaceSheet onClose={closeSheet} />}
    </>
  );
}

function MissingPlaceSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-50 rounded-[32px] bg-white px-5 pb-5 pt-4 text-center shadow-[0_22px_44px_rgba(36,60,143,0.28)]">
      <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#D8E6F8]" />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#F1F6FF] text-[#243C8F]"
        aria-label="닫기"
      >
        <X size={19} />
      </button>
      <p className="text-[13px] font-black text-[#7FADED]">장소 없음</p>
      <h1 className="mt-2 text-[22px] font-black text-[#243C8F]">장소를 찾을 수 없어요</h1>
      <p className="mt-2 text-[13px] font-bold leading-5 text-[#7898CE]">목록에서 다른 후보 장소를 선택해 주세요.</p>
    </div>
  );
}
