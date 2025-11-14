import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import { fetchBookmarks, reset, updateBookmark } from '../Util/bookmarkSlice';
import { setBookMarkMapAdd } from '../Util/modalSlice';
import SimpleBookmarkCard from '../Components/SimpleBookmarkCard';
import { selectCategory, selectSelectedId } from '../Util/categorySlice';
import toast from 'react-hot-toast';
import { addMapBookmark } from '../Util/bookmarkMapSlice';
import { removeMarker } from '../Util/bookmarkMarkerSlice';

const BookmarkMapAddModal = () => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector((state) => state.bookmark.items);
  const loading = useAppSelector((state) => state.bookmark.loading);
  const cursor = useAppSelector((state) => state.bookmark.cursor);
  const hasNext = useAppSelector((state) => state.bookmark.hasNext);

  const context = useAppSelector((state) => state.modal.bookmarkMapContext);
  const selectedGroupId = useAppSelector(
    (state) => state.group.selectedGroupId
  );
  const selectedCategory = useAppSelector(selectSelectedId);

  const [inputKeyword, setInputKeyword] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSelect = async (bookmarkId: number) => {
    if (!context) return;

    try {
      const res = await dispatch(
        updateBookmark({
          bookmarkId,
          latitude: context.position.lat,
          longitude: context.position.lng,
        })
      ).unwrap();

      const updatedBookmark = bookmarks.find(
        (b) => b.bookmarkId === bookmarkId
      );

      if (
        updatedBookmark?.categoryId === selectedCategory ||
        selectedCategory === -1
      ) {
        if (updatedBookmark) {
          // 위도, 경도 최신 정보로 업데이트
          const finalBookmark = { ...updatedBookmark, ...res };
          dispatch(addMapBookmark(finalBookmark));
        }
      } else {
        dispatch(removeMarker(context.id));
      }

      toast.success('북마크가 추가되었습니다.');
      dispatch(setBookMarkMapAdd({ open: false }));
    } catch (err) {
      console.log(err);
      toast.error('추가에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (selectedGroupId === null) return;
    dispatch(reset());
    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: -1,
        cursor: null,
        keyword: keyword,
      })
    );
  }, [dispatch, selectedGroupId, keyword]);

  const handleMore = () => {
    if (!selectedGroupId || selectCategory == null) return;
    if (!hasNext || loading) return;
    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: -1,
        cursor: cursor,
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
        className="flex overflow-x-auto space-x-10 h-80"
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
