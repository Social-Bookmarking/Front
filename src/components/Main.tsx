import { useEffect, useState } from 'react';
import { Bookmark, Plus } from 'lucide-react';
import BookmarkCard from './BookmarkCard';
import CategoryManager from './CategoryManager';
import { fetchBookmarks, reset } from '../Util/bookmarkSlice';
import { selectSelectedId } from '../Util/categorySlice';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import { setBookMarkAdd } from '../Util/modalSlice';

const Main = () => {
  const dispatch = useAppDispatch();

  const bookmarks = useAppSelector((s) => s.bookmark.items);
  const loading = useAppSelector((s) => s.bookmark.loading);
  const cursor = useAppSelector((s) => s.bookmark.cursor);
  const hasNext = useAppSelector((s) => s.bookmark.hasNext);

  const selectedCategory = useAppSelector(selectSelectedId);
  const selectedGroupId = useAppSelector((s) => s.group.selectedGroupId);

  const [inputKeyword, setInputKeyword] = useState('');
  const [keyword, setKeyword] = useState('');

  // 카테고리 변경 or 검색어 변경 시 첫 페이지 다시 불러오기
  useEffect(() => {
    if (selectedCategory === null || selectedGroupId === null) return;
    dispatch(reset());
    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: selectedCategory,
        cursor: null,
        keyword,
      })
    );
  }, [dispatch, selectedCategory, keyword, selectedGroupId]);

  // 더보기 버튼
  const handleMore = () => {
    if (!selectedGroupId || selectedCategory == null) return;
    if (!hasNext || loading) return;

    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: selectedCategory,
        cursor,
        keyword,
      })
    );
  };

  const handleSearch = () => {
    setKeyword(inputKeyword.trim());
  };

  if (selectedGroupId === null) {
    return (
      <main className="p-6 bg-gray-50 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">참여 중인 그룹이 없습니다</p>
          <p className="text-sm">그룹에 참여하거나 새 그룹을 생성해 주세요.</p>
        </div>
      </main>
    );
  }

  const isSearchResult = keyword.length > 0;
  const isEmpty = bookmarks.length === 0 && !loading;

  return (
    <main className="p-6 bg-gray-50">
      {/* 검색 바 */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="⌕ 북마크 검색..."
          className="flex-1 px-4 py-2 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={inputKeyword}
          onChange={(e) => setInputKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button
          className="px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700"
          onClick={handleSearch}
        >
          검색
        </button>
      </div>

      <div className="mb-6">
        <CategoryManager />
      </div>

      {/* 북마크 카드 목록 */}
      <div className="w-full flex items-center">
        {isEmpty ? (
          <div className="w-full flex justify-center py-10">
            <div className="flex flex-col items-center text-center text-gray-500 max-w-sm">
              <div className="w-14 h-14 mb-4 rounded-full bg-violet-50 flex items-center justify-center">
                <Bookmark className="w-7 h-7 text-violet-500" />
              </div>

              <p className="text-lg font-semibold mb-1">
                {isSearchResult
                  ? '검색 결과가 없습니다'
                  : '아직 북마크가 없습니다'}
              </p>

              <p className="text-sm mb-4 leading-relaxed">
                {isSearchResult
                  ? '다른 키워드로 다시 검색해 보세요.'
                  : '첫 번째 북마크를 추가해 보세요.'}
              </p>

              {!isSearchResult && (
                <button
                  className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-600 hover:underline"
                  onClick={() => dispatch(setBookMarkAdd(true))}
                >
                  <Plus className="w-4 h-4" />
                  북마크 추가하기
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-start items-center">
            {bookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.bookmarkId} {...bookmark} />
            ))}
          </div>
        )}
      </div>

      {/* 더 보기 버튼 */}
      <div className="mt-6 flex justify-center">
        {hasNext && selectedGroupId && (
          <button
            onClick={handleMore}
            disabled={loading}
            className="px-4 py-2 rounded bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? '불러오는 중...' : '더 보기'}
          </button>
        )}
      </div>
    </main>
  );
};

export default Main;
