import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import { fetchBookmarks, reset, updateBookmark } from '../Util/bookmarkSlice';
import { setBookMarkMapAdd } from '../Util/modalSlice';
import SimpleBookmarkCard from '../Components/SimpleBookmarkCard';
import { addBookmarkToMarker, removeMarker } from '../Util/bookmarkMarkerSlice';
import { selectCategory, selectSelectedId } from '../Util/categorySlice';
import toast from 'react-hot-toast';
import {
  clearBookmarkLocation,
  addBookmarkToMap,
} from '../Util/bookmarkMapSlice';

const BookmarkMapAddModal = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bookmark.items);
  const loading = useAppSelector((state) => state.bookmark.loading);
  const context = useAppSelector((state) => state.modal.bookmarkMapContext);
  const selectedCategory = useAppSelector(selectSelectedId);
  const selectedGroupId = useAppSelector(
    (state) => state.group.selectedGroupId
  );
  const markers = useAppSelector((state) => state.bookmarkMarker.markers);

  const [page, setPage] = useState(0);
  const totalPages = useAppSelector((state) => state.bookmark.totalPages);
  const [search, setSearch] = useState('');

  const handleSelect = async (bookmarkId: number) => {
    if (!context) return;

    //현재 마커에 이미 북마크가 있으면 위치 삭제
    const currentMarker = markers.find((m) => m.id === context.id);
    if (currentMarker && currentMarker.bookmarks.length > 0) {
      const prevBookmarkId = currentMarker.bookmarks[0];
      if (prevBookmarkId !== bookmarkId) {
        await dispatch(
          updateBookmark({
            bookmarkId: prevBookmarkId,
            latitude: -1,
            longitude: -1,
          })
        );
        dispatch(clearBookmarkLocation(prevBookmarkId));
      }
    }

    //북마크를 다른 마커로 이동
    const prevMarker = markers.find((m) => m.bookmarks.includes(bookmarkId));
    if (prevMarker) {
      await dispatch(
        updateBookmark({
          bookmarkId,
          latitude: -1,
          longitude: -1,
        })
      );
      dispatch(clearBookmarkLocation(bookmarkId));
      dispatch(removeMarker(prevMarker.id));
    }

    // 마커에 추가
    dispatch(
      addBookmarkToMarker({
        markerId: context.id,
        bookmarkId,
      })
    );
    // 위치 업데이트
    await dispatch(
      updateBookmark({
        bookmarkId,
        latitude: context.position.lat,
        longitude: context.position.lng,
      })
    );

    // 최신 지도 데이터 동기화
    const newBookmark = bookmarks.find((b) => b.bookmarkId === bookmarkId);
    if (newBookmark) {
      dispatch(
        addBookmarkToMap({
          ...newBookmark,
          latitude: context.position.lat,
          longitude: context.position.lng,
        })
      );
    }

    toast.success('북마크 위치가 업데이트 되었습니다.');
    dispatch(setBookMarkMapAdd({ open: false }));
  };

  useEffect(() => {
    dispatch(reset());
    setPage(1);
    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: selectedCategory,
        page: 0,
        keyword: '',
      })
    );
  }, [dispatch, selectedCategory, selectedGroupId]);

  const handleMore = () => {
    if (!selectedGroupId || selectCategory == null) return;
    if (page + 1 > totalPages) return;
    const next = page + 1;
    setPage(next);
    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: selectedCategory,
        page: next,
        keyword: '',
      })
    );
  };

  return (
    <div className="flex flex-col w-[40vw]">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold text-xl">북마크 선택</h2>
      </div>

      {/* 검색창 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="북마크 검색..."
        className="mb-2 px-4 py-2 border text-sm border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
      />

      {/* 북마크 리스트 */}
      <div
        className="flex overflow-x-auto space-x-2"
        onWheel={(e) => {
          e.currentTarget.scrollLeft += e.deltaY;
        }}
      >
        {bookmarks
          .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
          .map((b) => (
            <div key={b.bookmarkId} onClick={() => handleSelect(b.bookmarkId)}>
              <SimpleBookmarkCard {...b} />
            </div>
          ))}
      </div>

      {/* 더보기 버튼 */}
      <button
        className="mt-2 px-3 py-1 bg-violet-500 text-white rounded"
        onClick={handleMore}
        disabled={loading}
      >
        {loading ? '불러오는 중...' : '더 보기'}
      </button>
    </div>
  );
};

export default BookmarkMapAddModal;
