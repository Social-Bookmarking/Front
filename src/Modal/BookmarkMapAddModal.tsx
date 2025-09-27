import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import { fetchBookmarks, reset, updateBookmark } from '../Util/bookmarkSlice';
import { setBookMarkMapAdd } from '../Util/modalSlice';
import SimpleBookmarkCard from '../Components/SimpleBookmarkCard';
import { selectCategory, selectSelectedId } from '../Util/categorySlice';
import toast from 'react-hot-toast';
import { bookmarkMapreset, fetchBookmarksMap } from '../Util/bookmarkMapSlice';

const BookmarkMapAddModal = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bookmark.items);
  const loading = useAppSelector((state) => state.bookmark.loading);
  const context = useAppSelector((state) => state.modal.bookmarkMapContext);
  const selectedCategory = useAppSelector(selectSelectedId);
  const selectedGroupId = useAppSelector(
    (state) => state.group.selectedGroupId
  );

  const [page, setPage] = useState(0);
  const totalPages = useAppSelector((state) => state.bookmark.totalPages);

  const [inputKeyword, setInputKeyword] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSelect = async (bookmarkId: number) => {
    if (!context) return;

    try {
      await dispatch(
        updateBookmark({
          bookmarkId,
          latitude: context.position.lat,
          longitude: context.position.lng,
        })
      );

      dispatch(bookmarkMapreset());
      await dispatch(
        fetchBookmarksMap({
          groupId: selectedGroupId,
          categoryId: -1,
          page: 0,
          keyword: '',
        })
      );

      toast.success('북마크가 추가되었습니다.');
      dispatch(setBookMarkMapAdd({ open: false }));
    } catch (err) {
      console.log(err);
      toast.error('추가에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (selectedCategory === null || selectedGroupId === null) return;
    dispatch(reset());
    setPage(1);
    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: selectedCategory,
        page: 0,
        keyword: keyword,
      })
    );
  }, [dispatch, selectedCategory, selectedGroupId, keyword]);

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
        keyword: keyword,
      })
    );
  };

  const handleSearch = () => {
    setKeyword(inputKeyword.trim());
  };

  return (
    <div className="flex flex-col w-[40vw]">
      <div className="flex justify-between mb-2">
        <h2 className="font-semibold text-xl">북마크 선택</h2>
      </div>

      {/* 검색창 */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputKeyword}
          onChange={(e) => setInputKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="북마크 검색..."
          className="flex-1 px-4 py-2 border text-sm border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <button
          className="px-3 py-2 bg-violet-500 text-white rounded"
          onClick={handleSearch}
        >
          검색
        </button>
      </div>
      {/* 북마크 리스트 */}
      <div
        className="flex overflow-x-auto space-x-2 h-80"
        onWheel={(e) => {
          e.currentTarget.scrollLeft += e.deltaY;
        }}
      >
        {bookmarks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            검색 결과 없음
          </div>
        ) : (
          bookmarks.map((b) => (
            <div
              key={b.bookmarkId}
              onClick={() => handleSelect(b.bookmarkId)}
              className="w-[200px]"
            >
              <SimpleBookmarkCard {...b} />
            </div>
          ))
        )}
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
