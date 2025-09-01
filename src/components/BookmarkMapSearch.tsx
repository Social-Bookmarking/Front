import { useEffect, useState } from 'react';
import SimpleBookmarkCard from './SimpleBookmarkCard';
// 나중에 수정 : 위치가 있는 북마크만 받는 api로 바꿔야함.
import { fetchBookmarks, reset } from '../Util/bookmarkSlice';
import { useAppDispatch, useAppSelector } from '../Util/hook';

interface BookmarkMapSearchProps {
  onSelectBookmark: (lat: number, lng: number) => void;
}

const BookmarkMapSearch = ({ onSelectBookmark }: BookmarkMapSearchProps) => {
  const dispatch = useAppDispatch();

  const bookmarks = useAppSelector((s) => s.bookmark.items);
  const loading = useAppSelector((s) => s.bookmark.loading);

  const [page, setPage] = useState(1);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 검색 바 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="⌕ 북마크 검색..."
          className="w-full px-4 py-2 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* 북마크 카드 목록 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {bookmarks.map((bookmark, idx) => (
          <div
            key={idx}
            onClick={() =>
              onSelectBookmark(bookmark.latitude, bookmark.longitude)
            }
          >
            <SimpleBookmarkCard {...bookmark} />
          </div>
        ))}
      </div>

      {/* 더 보기 버튼 */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleMore}
          disabled={loading}
          className="px-4 py-2 rounded bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50"
        >
          {loading ? '불러오는 중...' : '더 보기'}
        </button>
      </div>
    </div>
  );
};

export default BookmarkMapSearch;
