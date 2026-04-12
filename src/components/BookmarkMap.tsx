import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MarkerClusterer,
} from 'react-kakao-maps-sdk';
import { Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../Util/hook';
import {
  bookmarkMapreset,
  fetchBookmarksMap,
  removeMapBookmark,
} from '../Util/bookmarkMapSlice';
import { setBookMarkMapAdd } from '../Util/modalSlice';
import SimpleBookmarkCard from './SimpleBookmarkCard';
import BookmarkMapSearch from './BookmarkMapSearch';
import {
  initializeMarkers,
  addMarker,
  removeMarker,
  toggleOpen,
  resetMarkers,
} from '../Util/bookmarkMarkerSlice';
import { updateBookmark } from '../Util/bookmarkSlice';
import toast from 'react-hot-toast';
import { selectSelectedId } from '../Util/categorySlice';
import ConfirmBox from './ConfirmBox';
import markerImg from '../assets/img/default/marker.png';

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
  const loading = useAppSelector((state) => state.bookmarkMap.loading);
  const cursor = useAppSelector((state) => state.bookmarkMap.cursor);
  const hasNext = useAppSelector((state) => state.bookmarkMap.hasNext);
  const selectedGroupId = useAppSelector(
    (state) => state.group.selectedGroupId,
  );
  const selectedCategory = useAppSelector(selectSelectedId);
  const userPermission = useAppSelector((state) => state.user.permission);

  const markers = useAppSelector((state) => state.bookmarkMarker.markers);
  const openIds = useAppSelector((state) => state.bookmarkMarker.openIds);
  const counter = useAppSelector((state) => state.bookmarkMarker.counter);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const totalElements = bookmarks.filter(
    (b) => b.latitude != null && b.longitude != null,
  ).length;

  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDelete, setIsDelete] = useState<
    null | 'markerDelete' | 'bookmarkDelete'
  >(null);

  useEffect(() => {
    if (!selectedGroupId || !selectedCategory) return;

    dispatch(bookmarkMapreset());
    dispatch(resetMarkers());

    dispatch(
      fetchBookmarksMap({
        groupId: selectedGroupId,
        categoryId: selectedCategory,
        cursor: null,
      }),
    );
  }, [dispatch, selectedCategory, selectedGroupId]);

  const handleMore = () => {
    if (!selectedGroupId) return;
    if (!hasNext || loading) return;
    dispatch(
      fetchBookmarksMap({
        groupId: selectedGroupId,
        categoryId: -1,
        cursor: cursor,
        keyword: searchKeyword,
      }),
    );
  };

  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);

  const resetClusterer = () => {
    const c = clustererRef.current;
    if (!c) return;

    try {
      c.clear();
    } catch (e) {
      console.warn('cluster clear failed', e);
    }

    clustererRef.current = null;
  };

  useEffect(() => {
    if (bookmarks.length > 0) {
      dispatch(
        initializeMarkers(
          bookmarks
            .filter((b) => b.latitude && b.longitude)
            .map((b) => ({
              bookmarkId: b.bookmarkId,
              lat: b.latitude as number,
              lng: b.longitude as number,
            })),
        ),
      );
    }
  }, [bookmarks, dispatch]);

  // 검색 관련 상태
  const [map, setMap] = useState<kakao.maps.Map>();

  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchCotainerRef = useRef<HTMLDivElement>(null);

  // 지도 첫 북마크 위치로 이동
  useEffect(() => {
    if (map && bookmarks.length > 0) {
      const first = bookmarks[0];
      if (first.latitude && first.longitude) {
        map.relayout();
        map.setCenter(new kakao.maps.LatLng(first.latitude, first.longitude));
        map.setLevel(2);
      }
    }
  }, [map, bookmarks]);

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
      } else {
        setPlaces([]);
      }
    });
  };

  // 장소 검색 -> 이동
  const moveToPlace = (p: Place) => {
    if (!map) return;
    const lat = Number(p.y);
    const lng = Number(p.x);

    const center = new kakao.maps.LatLng(lat, lng);

    map.relayout();
    map.setCenter(center);
    map.setLevel(2);

    if (userPermission !== 'VIEWER') {
      dispatch(
        addMarker({
          lat,
          lng,
        }),
      );
    }
  };

  // 북마크 검색 -> 이동
  const moveToBookmark = (lat: number, lng: number) => {
    if (!map) return;
    const center = new kakao.maps.LatLng(lat, lng);
    map.setCenter(center);
    map.setLevel(2);

    mapContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    dispatch(bookmarkMapreset());
    dispatch(
      fetchBookmarksMap({
        groupId: selectedGroupId,
        categoryId: -1,
        cursor: null,
        keyword,
      }),
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

  const handleRemove = async (bookmarkId: number) => {
    try {
      await dispatch(
        updateBookmark({
          bookmarkId,
          latitude: -1,
          longitude: -1,
        }),
      );

      dispatch(removeMapBookmark(bookmarkId));

      toast.success('북마크가 삭제되었습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
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
            center={{ lat: 37.5665, lng: 126.978 }}
            className="w-full h-full"
            level={3}
            onCreate={setMap}
            onClick={(_, MouseEvent) => {
              const latlng = MouseEvent.latLng;
              if (userPermission !== 'VIEWER') {
                resetClusterer();
                dispatch(
                  addMarker({
                    lat: latlng.getLat(),
                    lng: latlng.getLng(),
                  }),
                );
              }
            }}
          >
            {/* 마커 모달 */}
            <MarkerClusterer
              key={counter}
              averageCenter={true}
              minLevel={3}
              onCreate={(c) => {
                clustererRef.current = c;
              }}
            >
              {markers.map((m) => {
                const isHovered = hoveredId === m.id;

                return (
                  <MapMarker
                    key={m.id}
                    position={m.position}
                    image={{
                      src: markerImg,
                      size: isHovered
                        ? { width: 44, height: 44 }
                        : { width: 36, height: 36 },
                      options: {
                        offset: isHovered ? { x: 22, y: 44 } : { x: 18, y: 36 },
                      },
                    }}
                    onMouseOver={() => setHoveredId(m.id)}
                    onMouseOut={() => setHoveredId(null)}
                    onClick={() => {
                      if (map) {
                        if (map && map.getLevel() >= 3) {
                          map.setLevel(2);
                        }
                        const center = new kakao.maps.LatLng(
                          m.position.lat,
                          m.position.lng,
                        );
                        map.setCenter(center);
                        dispatch(toggleOpen(m.id));
                      }
                    }}
                  />
                );
              })}
            </MarkerClusterer>
            {markers.map(
              (m) =>
                openIds.includes(m.id) && (
                  <CustomOverlayMap
                    key={'overlay-' + m.id}
                    position={m.position}
                    yAnchor={0.5}
                    zIndex={999}
                  >
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
                                className={`absolute top-2 right-2 ${
                                  userPermission === 'VIEWER'
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-gray-500'
                                } text-red-500 rounded`}
                                disabled={userPermission === 'VIEWER'}
                                onClick={() => setIsDelete('bookmarkDelete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {isDelete === 'bookmarkDelete' && (
                                <ConfirmBox
                                  message="정말 삭제 하시겠습니까?"
                                  onConfirm={() => {
                                    handleRemove(b.bookmarkId);
                                    setIsDelete(null);
                                  }}
                                  onCancel={() => setIsDelete(null)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 북마크 추가 버튼 */}
                      <button
                        className={`mt-2 px-2 py-1 bg-violet-500 ${
                          userPermission === 'VIEWER'
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:bg-violet-600'
                        } text-white rounded text-xs`}
                        disabled={userPermission === 'VIEWER'}
                        onClick={() =>
                          dispatch(
                            setBookMarkMapAdd({
                              open: true,
                              marker: m,
                            }),
                          )
                        }
                      >
                        {m.bookmarks.length === 0
                          ? '북마크 추가'
                          : '북마크 수정'}
                      </button>
                      <div className="flex w-full items-center justify-between mt-2 space-x-2 text-xs">
                        <button
                          className={`bg-red-500 w-full ${
                            userPermission === 'VIEWER'
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:bg-red-600'
                          } text-white px-2 py-1 rounded`}
                          disabled={userPermission === 'VIEWER'}
                          onClick={() => setIsDelete('markerDelete')}
                        >
                          마커 삭제
                        </button>
                        <button
                          className="bg-gray-200 w-full px-2 py-1 hover:bg-gray-300 rounded"
                          onClick={() => dispatch(toggleOpen(m.id))}
                        >
                          닫기
                        </button>
                        {isDelete === 'markerDelete' && (
                          <ConfirmBox
                            message="정말 삭제 하시겠습니까?"
                            onConfirm={async () => {
                              if (m.bookmarks.length > 0) {
                                const bid = m.bookmarks[0];
                                handleRemove(bid);
                              }
                              // 마커 제거
                              dispatch(removeMarker(m.id));
                              setIsDelete(null);
                            }}
                            onCancel={() => setIsDelete(null)}
                          />
                        )}
                      </div>
                    </div>
                  </CustomOverlayMap>
                ),
            )}
          </Map>

          <div className="absolute top-2 left-2 bg-violet-600 z-1 hover:bg-violet-700 rounded-lg">
            <button
              className="px-3 py-1 text-sm text-white"
              onClick={handleMore}
            >
              더 보기 (
              {
                bookmarks.filter(
                  (b) => b.latitude != null && b.longitude != null,
                ).length
              }
              /{totalElements})
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
        />
      </div>
    </div>
  );
};

export default BookmarkMap;
