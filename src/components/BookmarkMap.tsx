import { CustomOverlayMap, Map, MapMarker } from 'react-kakao-maps-sdk';
import { Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../Util/hook';
import { bookmarkMapreset, fetchBookmarksMap } from '../Util/bookmarkMapSlice';
import { setBookMarkMapAdd } from '../Util/modalSlice';
import SimpleBookmarkCard from './SimpleBookmarkCard';
import BookmarkMapSearch from './BookmarkMapSearch';
import {
  initializeMarkers,
  addMarker,
  removeMarker,
  toggleOpen,
  removeBookmarkFromMarker,
} from '../Util/bookmarkMarkerSlice';

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
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bookmarkMap.items);
  const selectedGroupId = useAppSelector(
    (state) => state.group.selectedGroupId
  );
  const markers = useAppSelector((state) => state.bookmarkMarker.markers);
  const openIds = useAppSelector((state) => state.bookmarkMarker.openIds);
  const totalElements = useAppSelector(
    (state) => state.bookmarkMap.totalElements
  );

  const page = useAppSelector((state) => state.bookmarkMap.page);
  const totalPages = useAppSelector((state) => state.bookmarkMap.totalPages);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    dispatch(
      fetchBookmarksMap({
        groupId: selectedGroupId,
        categoryId: -1,
        page: 0,
        keyword: '',
      })
    );
  }, [dispatch, selectedGroupId]);

  const handleMore = () => {
    if (!selectedGroupId) return;
    if (page + 1 >= totalPages) return;
    dispatch(
      fetchBookmarksMap({
        groupId: selectedGroupId,
        categoryId: -1,
        page: page + 1,
        keyword: searchKeyword,
      })
    );
  };

  useEffect(() => {
    if (bookmarks.length > 0) {
      dispatch(
        initializeMarkers(
          bookmarks
            .filter((b) => b.latitude && b.longitude)
            .map((b) => ({
              bookmarkId: b.bookmarkId,
              lat: b.latitude,
              lng: b.longitude,
            }))
        )
      );
    }
  }, [bookmarks, dispatch]);

  // 검색 관련 상태
  const [map, setMap] = useState<kakao.maps.Map>();
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchCotainerRef = useRef<HTMLDivElement>(null);

  const stopOnMap = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    kakao.maps.event.preventMap?.();
  };

  const searchPlaces = () => {
    if (!map || !keyword.trim()) return;

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setPlaces(data as Place[]);
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

  // 장소 검색 -> 이동
  const moveToPlace = (p: Place) => {
    if (!map) return;
    const center = new kakao.maps.LatLng(Number(p.y), Number(p.x));
    map.setCenter(center);
    map.setLevel(1);
  };

  // 북마크 검색 -> 이동
  const moveToBookmark = (lat: number, lng: number) => {
    if (!map) return;
    const center = new kakao.maps.LatLng(lat, lng);
    map.setCenter(center);
    map.setLevel(1);

    mapContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    dispatch(bookmarkMapreset());
    dispatch(
      fetchBookmarksMap({
        groupId: selectedGroupId,
        categoryId: -1,
        page: 0,
        keyword,
      })
    )
      .unwrap()
      .then((res) => {
        if (res.content.length === 1) {
          const b = res.content[0];
          if (b.latitude && b.longitude) {
            const center = new kakao.maps.LatLng(b.latitude, b.longitude);
            map?.setCenter(center);
            map?.setLevel(2);
          }
        }
      });
  };

  return (
    <div className="flex flex-col bg-gray-50">
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">북마크 지도</h1>
          <div className="flex justify-between mt-2">
            <p>저장된 북마크를 지도에서 확인하세요</p>
            <button
              className="px-2 py-2 bg-violet-500 text-white rounded text-xs"
              onClick={() => {
                searchCotainerRef.current?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              북마크 검색
            </button>
          </div>
        </div>

        {/* 지도 */}
        <div
          ref={mapContainerRef}
          className="h-[calc(100vh-250px)] rounded-lg border bg-card relative"
        >
          <Map
            id="map"
            center={{ lat: 36.1185, lng: 128.4227 }}
            className="w-full h-full"
            level={3}
            onCreate={setMap}
            onClick={(_, MouseEvent) => {
              const latlng = MouseEvent.latLng;
              dispatch(
                addMarker({
                  lat: latlng.getLat(),
                  lng: latlng.getLng(),
                })
              );
            }}
          >
            {/* 마커 모달 */}
            {markers.map((m) => (
              <div key={m.id}>
                <MapMarker
                  position={m.position}
                  onClick={() => dispatch(toggleOpen(m.id))}
                />
                {openIds.includes(m.id) && (
                  <CustomOverlayMap position={m.position} yAnchor={1}>
                    <div
                      className="flex flex-col rounded-lg shadow bg-white border p-3 text-sm min-w-60"
                      onMouseDown={stopOnMap}
                      onTouchStart={stopOnMap}
                      onClick={stopOnMap}
                    >
                      {/* 마커에 등록된 북마크 리스트 */}
                      <div
                        className="space-y-2 max-h-75 overflow-y-auto"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {m.bookmarks.map((bid) => {
                          const b = bookmarks.find((b) => b.bookmarkId === bid);
                          if (!b) return null;
                          return (
                            <div key={bid} className="relative">
                              <SimpleBookmarkCard {...b} />
                              <button
                                className="absolute top-2 right-2 text-red-500"
                                onClick={() =>
                                  dispatch(
                                    removeBookmarkFromMarker({
                                      markerId: m.id,
                                      bookmarkId: bid,
                                    })
                                  )
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* 북마크 추가 버튼 */}
                      <button
                        className="mt-2 px-2 py-1 bg-violet-500 text-white rounded text-xs"
                        onClick={() =>
                          dispatch(
                            setBookMarkMapAdd({
                              open: true,
                              marker: m,
                            })
                          )
                        }
                      >
                        북마크 추가
                      </button>
                      <div className="flex w-full items-center justify-between mt-2 space-x-2 text-xs">
                        <button
                          className="bg-red-500 w-full text-white px-2 py-1 rounded"
                          onClick={() => dispatch(removeMarker(m.id))}
                        >
                          마커 삭제
                        </button>
                        <button
                          className="bg-gray-200 w-full px-2 py-1 rounded"
                          onClick={() => dispatch(toggleOpen(m.id))}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  </CustomOverlayMap>
                )}
              </div>
            ))}
          </Map>

          <div className="absolute top-2 left-2 bg-violet-600 z-1 hover:bg-violet-700 rounded-lg">
            <button
              className="px-3 py-1 text-sm text-white"
              onClick={handleMore}
            >
              더 보기 ({bookmarks.length}/{totalElements})
            </button>
          </div>

          <div className="absolute top-0 right-0 bg-white/50 rounded-lg shadow-lg w-72 max-h-35 md:max-h-full overflow-hidden flex flex-col z-1">
            {/* 검색창 */}
            <div className="flex gap-2 p-2 border-b">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="장소 검색"
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
                <li className="text-gray-400 text-center py-2">
                  검색 결과 없음
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div ref={searchCotainerRef}>
        <BookmarkMapSearch
          onSelectBookmark={moveToBookmark}
          onMore={handleMore}
          onSearch={handleSearch}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default BookmarkMap;
