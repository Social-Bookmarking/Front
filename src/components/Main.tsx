import { useEffect, useState } from 'react';
import BookmarkCard from './BookmarkCard';
import CategoryManager from './CategoryManager';
import { fetchBookmarks, reset } from '../Util/bookmarkSlice';
import { selectSelectedId } from '../Util/categorySlice';
import { useAppDispatch, useAppSelector } from '../Util/hook';

const Main = () => {
  const dispatch = useAppDispatch();

  const bookmarks = useAppSelector((s) => s.bookmark.items);
  const loading = useAppSelector((s) => s.bookmark.loading);

  const selectedCategory = useAppSelector(selectSelectedId);

  const [page, setPage] = useState(1);

  // 카테고리 변경 시 첫 페이지 다시 불러오기
  // 수정해야 함.
  useEffect(() => {
    if (selectedCategory === null) return;
    dispatch(reset());
    setPage(1);
    dispatch(fetchBookmarks(1));
  }, [dispatch, selectedCategory]);

  // 더보기 버튼
  const handleMore = () => {
    const next = page + 1;
    setPage(next);
    dispatch(fetchBookmarks(next));
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      {/* 검색 바 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="⌕ 북마크 검색..."
          className="w-full px-4 py-2 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div className="mb-6">
        <CategoryManager />
      </div>

      {/* 북마크 카드 목록 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {bookmarks.map((bookmark, idx) => (
          <BookmarkCard key={idx} {...bookmark} />
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
    </main>
  );
};

export default Main;
