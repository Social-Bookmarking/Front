import { CustomOverlayMap, Map, MapMarker } from 'react-kakao-maps-sdk';
import { useState } from 'react';

type latlng = { lat: number; lng: number };
type Marker = { id: number; position: latlng };

interface Place {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  phone?: string;
  x: string; // 경도
  y: string; // 위도
}

const BookmarkMap = () => {
  const [position, setPosition] = useState<Marker[]>([]);
  const [counter, setCounter] = useState<number>(1);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  // 검색 관련 상태
  const [map, setMap] = useState<kakao.maps.Map>();
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);

  const stopOnMap = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    kakao.maps.event.preventMap?.();
  };

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const searchPlaces = () => {
    if (!map || !keyword.trim()) return;

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setPlaces(data as Place[]);
        // 검색된 장소 범위로 지도 이동
        const bounds = new kakao.maps.LatLngBounds();
        for (let i = 0; i < data.length; i++) {
          bounds.extend(
            new kakao.maps.LatLng(Number(data[i].y), Number(data[i].x))
          );
        }
        map.setBounds(bounds);
      } else {
        setPlaces([]);
      }
    });
  };

  const moveToPlace = (p: Place) => {
    if (!map) return;
    const center = new kakao.maps.LatLng(Number(p.y), Number(p.x));
    map.setCenter(center);
    map.setLevel(1);
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">북마크 지도</h1>
        <p className="mt-2">저장된 북마크를 지도에서 확인하세요</p>
      </div>

      {/* 지도 */}
      <div className="h-[calc(100vh-250px)] rounded-lg border bg-card relative">
        <Map
          id="map"
          center={{ lat: 36.1185, lng: 128.4227 }}
          className="w-full h-full"
          level={3}
          onCreate={setMap}
          onClick={(_, MouseEvent) => {
            const latlng = MouseEvent.latLng;
            setPosition((prev) => [
              ...prev,
              {
                id: counter,
                position: { lat: latlng.getLat(), lng: latlng.getLng() },
              },
            ]);
            setCounter((n) => n + 1);
          }}
        >
          {position.map((m) => (
            <>
              <MapMarker
                key={m.id}
                position={m.position}
                onClick={() => toggleOpen(m.id)}
              />
              {openIds.has(m.id) && (
                <CustomOverlayMap position={m.position} yAnchor={1}>
                  <div
                    className="flex flex-col rounded-lg shadow bg-white border p-3 text-sm min-w-40"
                    onMouseDown={stopOnMap}
                    onTouchStart={stopOnMap}
                    onClick={stopOnMap}
                  >
                    <div className="font-semibold mb-1">마커 : {m.id}</div>
                    <div
                      onClick={(e) => {
                        stopOnMap(e);
                        toggleOpen(m.id);
                      }}
                    >
                      닫기
                    </div>
                  </div>
                </CustomOverlayMap>
              )}
            </>
          ))}
        </Map>

        <div className="absolute top-0 right-0 bg-white/50 rounded-lg shadow-lg w-72 max-h-35 md:max-h-full overflow-hidden flex flex-col z-1">
          {/* 검색창 */}
          <div className="flex gap-2 p-2 border-b">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="키워드 검색"
              className="flex-1 border rounded px-2 py-1 text-sm opacity-200"
            />
            <button
              onClick={searchPlaces}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
            >
              검색
            </button>
          </div>

          {/* 검색 결과 리스트 */}
          <ul className="flex-1 overflow-y-auto p-2 space-y-1 text-sm">
            {places.map((p, i) => (
              <li
                key={p.id}
                className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => moveToPlace(p)}
              >
                <div className="font-semibold">
                  {i + 1}. {p.place_name}
                </div>
                <div className="text-gray-600">
                  {p.road_address_name || p.address_name}
                </div>
                {p.phone && (
                  <div className="text-xs text-gray-500">📞 {p.phone}</div>
                )}
              </li>
            ))}
            {places.length === 0 && (
              <li className="text-gray-400 text-center py-2">검색 결과 없음</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookmarkMap;
