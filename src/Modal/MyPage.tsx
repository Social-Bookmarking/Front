import {
  User,
  LogOut,
  Save,
  Shield,
  Bookmark,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import Avatar from '../Components/Avatar';
import { useState, useEffect } from 'react';
import SimpleBookmarkCard from '../Components/SimpleBookmarkCard';
import { fetchBookmarks, reset } from '../Util/bookmarkSlice';
import { useAppSelector, useAppDispatch } from '../Util/hook';

const MyPage = () => {
  const [tab, setTab] = useState<'profile' | 'security' | 'myBookmark'>(
    'profile'
  );
  const dispatch = useAppDispatch();

  // 비밀번호 관련
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 북마크 관련
  const [page, setPage] = useState(1);
  const bookmarks = useAppSelector((state) => state.bookmark.items);
  const loading = useAppSelector((state) => state.bookmark.loading);

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
    <div className="w-[50vw] min-w-sm max-h-[80vw] flex flex-col overflow-auto scrollbar-hidden space-y-5">
      <h2 className="text-xl font-semibold text-violet-600 flex items-center gap-2">
        <User className="w-5 h-5" /> 마이페이지
      </h2>

      <div className="border-2 border-[#E6E5F2] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Avatar name="김동천" src="" avatarSize={10} />
          <div>
            <p className="font-bold">김동천</p>
            <p className="text-sm text-gray-500">email@example.com</p>
          </div>
        </div>
      </div>
      <div className="flex mb-6 rounded-md p-1 bg-gray-100">
        <button
          className={`flex-1 flex items-center justify-center p-2 text-xs font-medium rounded-md ${
            tab === 'profile'
              ? 'bg-white text-black shadow-2xs'
              : 'text-gray-500'
          }`}
          onClick={() => setTab('profile')}
        >
          <User className="w-3 h-3 mr-2" />
          <span>프로필</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center p-2 text-xs font-medium rounded-md ${
            tab === 'security'
              ? 'bg-white text-black shadow-2xs'
              : 'text-gray-500'
          }`}
          onClick={() => setTab('security')}
        >
          <Shield className="w-3 h-3 mr-2" />
          <span>보안</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center p-2 text-xs font-medium rounded-md ${
            tab === 'myBookmark'
              ? 'bg-white text-black shadow-2xs'
              : 'text-gray-500'
          }`}
          onClick={() => setTab('myBookmark')}
        >
          <Bookmark className="w-3 h-3 mr-2" />
          <span>내 북마크</span>
        </button>
      </div>
      {/* 프로필 수정 */}
      {tab === 'profile' && (
        <>
          <div className="border-2 flex flex-col items-center border-[#E6E5F2] rounded-xl p-4 space-y-3">
            <Avatar name="김동천" src="" avatarSize={16} />
            <p className="text-sm text-gray-500">사진을 클릭하여 변경하세요</p>
          </div>
          <div className="border-2 flex flex-col border-[#E6E5F2] rounded-xl space-y-3">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex w-full gap-3">
                <div className="flex flex-col flex-1 min-w-0">
                  <p>이름</p>
                  <input
                    type="text"
                    className="px-2 py-1 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p>전화번호</p>
                  <input
                    type="text"
                    className="px-2 py-1 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full">
                <p>이메일</p>
                <input
                  type="text"
                  className="px-2 py-1 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>
          </div>
          <button className="w-full flex shrink-0 items-center justify-center h-8 rounded-md bg-gradient-to-r from-violet-600 to-blue-500 text-white">
            <Save className="w-5 h-5 mr-2" />
            <span>저장하기</span>
          </button>
        </>
      )}
      {/* 비밀번호 수정 */}
      {tab === 'security' && (
        <>
          <div className="border-2 flex flex-col border-[#E6E5F2] rounded-xl space-y-3">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-col">
                <p>현재 비밀번호</p>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className="w-full px-2 py-1 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex w-full gap-3">
                <div className="flex flex-col flex-1 min-w-0">
                  <p>새 비밀번호</p>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="w-full px-2 py-1 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((prev) => !prev)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    >
                      {showNew ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p>비밀번호 확인</p>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="w-full px-2 py-1 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full flex shrink-0 items-center justify-center h-8 rounded-md bg-gradient-to-r from-violet-600 to-blue-500 text-white">
            <span>비밀번호 변경</span>
          </button>
          <div className="flex w-full gap-3">
            <button className="flex-1 min-w-0 flex shrink-0 border-2 border-[#E6E5F2] items-center justify-center h-8 rounded-md bg-white text-gray-800">
              <LogOut className="w-5 h-5 mr-2" />
              <span>로그아웃</span>
            </button>
            <button className="flex-1 min-w-0 flex shrink-0 items-center justify-center h-8 rounded-md bg-red-500 text-white">
              <Trash2 className="w-5 h-5 mr-2" />
              <span>계정 탈퇴</span>
            </button>
          </div>
        </>
      )}

      {/* 내가 등록한 북마크 보기 */}
      {tab === 'myBookmark' && (
        <>
          <div
            className="flex overflow-x-auto overscroll-contain space-x-2"
            onWheel={(e) => {
              e.currentTarget.scrollLeft += e.deltaY;
            }}
          >
            {bookmarks.map((b) => (
              <div key={b.bookmarkId}>
                <SimpleBookmarkCard {...b} />
              </div>
            ))}
          </div>
          <button
            className="mt-2 px-3 py-1 bg-violet-500 text-white rounded"
            onClick={handleMore}
            disabled={loading}
          >
            {loading ? '불러오는 중...' : '더 보기'}
          </button>
        </>
      )}
    </div>
  );
};

export default MyPage;
