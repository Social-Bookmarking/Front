import { useState } from 'react';
import SimpleBookmarkCard from './SimpleBookmarkCard';
import { useAppSelector } from '../Util/hook';

interface BookmarkMapSearchProps {
  onSelectBookmark: (lat: number, lng: number) => void;
  onSearch: (keyword: string) => void;
  onMore: () => void;
  page: number;
  totalPages: number;
}

const BookmarkMapSearch = ({
  onSelectBookmark,
  onSearch,
  onMore,
  page,
  totalPages,
}: BookmarkMapSearchProps) => {
  const bookmarks = useAppSelector((state) => state.bookmarkMap.items);
  const loading = useAppSelector((state) => state.bookmark.loading);

  const [inputKeyword, setInputKeyword] = useState('');

  const handleSearch = () => {
    onSearch(inputKeyword.trim());
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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

      {/* 북마크 카드 목록 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {bookmarks.length > 0 ? (
          bookmarks
            .filter((b) => b.latitude != null && b.longitude != null)
            .map((bookmark, idx) => (
              <div
                key={idx}
                onClick={() =>
                  onSelectBookmark(
                    bookmark.latitude as number,
                    bookmark.longitude as number
                  )
                }
              >
                <SimpleBookmarkCard {...bookmark} />
              </div>
            ))
        ) : (
          <div className="text-center text-gray-500 col-span-full">
            검색 결과 없음
          </div>
        )}
      </div>

      {/* 더 보기 버튼 */}
      {page + 1 <= totalPages && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onMore}
            disabled={loading}
            className="px-4 py-2 rounded bg-violet-500 text-white"
          >
            {loading ? '불러오는 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookmarkMapSearch;
