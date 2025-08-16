import { CustomOverlayMap, Map, MapMarker } from 'react-kakao-maps-sdk';
import { useState, useEffect } from 'react';

type latlng = { lat: number; lng: number };
type Marker = { id: number; position: latlng };

const BookmarkMap = () => {
  const [position, setPosition] = useState<Marker[]>([]);
  const [counter, setCounter] = useState<number>(1);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const stopOnMap = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    kakao.maps.event.preventMap?.();
  };

  useEffect(() => {
    console.log(position);
  }, [position]);

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">북마크 지도</h1>
        <p className="mt-2">저장된 북마크를 지도에서 확인하세요</p>
      </div>
      <div className="h-[calc(100vh-250px)] rounded-lg border bg-card">
        <Map
          id="map"
          center={{ lat: 36.1185, lng: 128.4227 }}
          className="w-full h-full"
          level={3}
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
      </div>
    </div>
  );
};

export default BookmarkMap;
