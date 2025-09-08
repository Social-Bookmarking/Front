import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchBookmarks,
  reset,
  updateBookmarkLocation,
} from '../Util/bookmarkSlice';
import { setBookMarkMapAdd } from '../Util/modalSlice';
import SimpleBookmarkCard from '../Components/SimpleBookmarkCard';
import { addBookmarkToMarker } from '../Util/bookmarkMapSlice';

const BookmarkMapAddModal = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bookmark.items);
  const loading = useAppSelector((state) => state.bookmark.loading);
  const context = useAppSelector((state) => state.modal.bookmarkMapContext);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const handleSelect = (bookmarkId: number) => {
    if (!context) return;
    // 마커에 추가
    dispatch(
      addBookmarkToMarker({
        markerId: context.id,
        bookmarkId,
      })
    );
    // 위치 업데이트
    dispatch(
      updateBookmarkLocation({
        bookmarkId,
        latitude: context.position.lat,
        longitude: context.position.lng,
      })
    );
    dispatch(setBookMarkMapAdd({ open: false }));
  };

  useEffect(() => {
    dispatch(reset());
    setPage(1);
    dispatch(fetchBookmarks(1));
  }, [dispatch]);

  const handleMore = () => {
    const next = page + 1;
    setPage(next);
    dispatch(fetchBookmarks(next));
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
        className="flex overflow-y-auto space-x-2"
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
