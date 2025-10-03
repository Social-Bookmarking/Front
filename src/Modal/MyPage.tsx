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
import {
  fetchCreatedBookmarks,
  fetchLikedBookmarks,
  resetCreated,
  resetLiked,
} from '../Util/userBookmarkSlice';
import { useAppSelector, useAppDispatch } from '../Util/hook';
import { changePassword, fetchUserInfo, updateUserInfo } from '../Util/user';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmBox from '../Components/ConfirmBox';
import { fetchMembers } from '../Util/memberSlice';
import { selectSelectedGroup } from '../Util/groupSlice';

const MyPage = () => {
  const [tab, setTab] = useState<'profile' | 'security' | 'myBookmark'>(
    'profile'
  );
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.user);
  const [nickname, setNickname] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const selectedGroupId = useAppSelector(selectSelectedGroup);

  // 비밀번호 관련
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 북마크 관련
  const [createdPage, setCreatedPage] = useState(0);
  const [likedPage, setLikedPage] = useState(0);
  const created = useAppSelector((state) => state.userBookmark.created);
  const liked = useAppSelector((state) => state.userBookmark.liked);
  const [bookmarkView, setBookmarkView] = useState<'created' | 'liked'>(
    'created'
  );

  // 이미지 관련
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState<
    null | 'profile' | 'password' | 'logout' | 'delete'
  >(null);

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  useEffect(() => {
    if (user.nickname) {
      setNickname(user.nickname);
    }
  }, [user.nickname]);

  useEffect(() => {
    if (tab === 'myBookmark') {
      if (bookmarkView === 'created') {
        dispatch(resetCreated());
        setCreatedPage(1);
        dispatch(fetchCreatedBookmarks(1));
      } else {
        dispatch(resetLiked());
        setLikedPage(1);
        dispatch(fetchLikedBookmarks(1));
      }
    }
  }, [tab, bookmarkView, dispatch]);

  const handleMore = (bookmarkView: 'created' | 'liked') => {
    if (bookmarkView === 'created') {
      if (createdPage + 1 > created.totalPages) return;
      const next = createdPage + 1;
      setCreatedPage(next);
      dispatch(fetchCreatedBookmarks(next));
    } else {
      if (likedPage + 1 > liked.totalPages) return;
      const next = likedPage + 1;
      setLikedPage(next);
      dispatch(fetchLikedBookmarks(next));
    }
  };

  // 이미지 업로드
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    console.log(file.name, file.type);

    try {
      setUploading(true);

      setPreviewUrl(URL.createObjectURL(file));

      const res = await axios.get(
        `https://www.marksphere.link/api/me/profile/upload-url`,
        {
          params: { fileName: file.name },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { presignedUrl, fileKey } = res.data;

      // presigned URL에 PUT으로 업로드
      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      // 성공하면 imageKey 업데이트
      setImageKey(fileKey);
      console.log(fileKey);
      setIsImageDeleted(false);
    } catch (err) {
      console.log(err);
      toast.error('이미지 문제가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    dispatch(changePassword({ currentPassword, newPassword }))
      .unwrap()
      .then(() => {
        toast.success('비밀번호가 변경되었습니다.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSaveProfile = () => {
    const payload: Partial<{ nickname: string; imageKey: string }> = {};

    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요');
      return;
    }

    if (user.nickname !== nickname.trim()) {
      payload.nickname = nickname.trim();
    }

    // 이미지가 새로 업로드 되었거나 삭제된 경우에만 보냄
    if (imageKey) {
      payload.imageKey = imageKey; // 새 이미지 키
    } else if (isImageDeleted) {
      payload.imageKey = '';
    }

    console.log(payload);

    dispatch(updateUserInfo(payload))
      .unwrap()
      .then(() => {
        dispatch(fetchUserInfo());
        setPreviewUrl(null);
        setImageKey('');
        setIsImageDeleted(false);
        if (selectedGroupId !== null) {
          dispatch(fetchMembers(selectedGroupId));
        }
      });

    // dispatch(setMyPage(false));
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        'https://www.marksphere.link/api/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        }
      );
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete('https://www.marksphere.link/api/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      toast.error('회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-[50vw] min-w-sm max-h-[80vw] flex flex-col overflow-auto scrollbar-hidden space-y-5">
      <h2 className="text-xl font-semibold text-violet-600 flex items-center gap-2">
        <User className="w-5 h-5" /> 마이페이지
      </h2>

      <div className="border-2 border-[#E6E5F2] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Avatar
            name={user.nickname}
            src={user.profileImageUrl}
            avatarSize={10}
          />
          <div>
            <p className="font-bold">{user.nickname}</p>
            {/* <p className="text-sm text-gray-500">email@example.com</p> */}
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
            {user.profileImageUrl && (
              <button
                className="mt-2 text-xs text-red-500 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(null);
                  setImageKey('');
                  setIsImageDeleted(true);
                }}
              >
                기본 이미지
              </button>
            )}
            <label className="cursor-pointer flex flex-col items-center space-y-3">
              <Avatar
                name={user.nickname}
                src={
                  isImageDeleted
                    ? undefined
                    : previewUrl || user.profileImageUrl
                }
                avatarSize={16}
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-500">
                사진을 클릭하여 변경하세요
              </p>
            </label>
            {uploading && <p className="text-xs text-gray-400">업로드 중...</p>}
          </div>
          <div className="border-2 flex flex-col border-[#E6E5F2] rounded-xl space-y-3">
            <div className="flex flex-col gap-3 p-4">
              {/* <div className="flex w-full gap-3">
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
              </div> */}
              <div className="flex flex-col w-full">
                <p className="mb-2">닉네임 변경</p>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="px-2 py-1 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>
          </div>
          <button
            className="w-full flex shrink-0 items-center justify-center h-8 rounded-md bg-gradient-to-r from-violet-600 to-blue-500 text-white"
            onClick={() => setConfirmOpen('profile')}
            disabled={uploading}
          >
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
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
          <button
            className="w-full flex shrink-0 items-center justify-center h-8 rounded-md bg-gradient-to-r from-violet-600 to-blue-500 text-white"
            onClick={() => setConfirmOpen('password')}
          >
            <span>비밀번호 변경</span>
          </button>
          <div className="flex w-full gap-3">
            <button
              className="flex-1 min-w-0 flex shrink-0 border-2 border-[#E6E5F2] items-center justify-center h-8 rounded-md bg-white text-gray-800"
              onClick={() => setConfirmOpen('logout')}
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>로그아웃</span>
            </button>
            <button
              className="flex-1 min-w-0 flex shrink-0 items-center justify-center h-8 rounded-md bg-red-500 text-white"
              onClick={() => setConfirmOpen('delete')}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              <span>계정 탈퇴</span>
            </button>
          </div>
        </>
      )}

      {/* 내가 등록한 북마크 보기 */}
      {tab === 'myBookmark' && (
        <>
          <div className="flex mb-4 rounded-md p-1 bg-gray-100">
            <button
              className={`flex-1 flex items-center justify-center p-2 text-xs font-medium rounded-md ${
                bookmarkView === 'created'
                  ? 'bg-white text-black shadow-2xs'
                  : 'text-gray-500'
              }`}
              onClick={() => setBookmarkView('created')}
            >
              내 북마크
            </button>
            <button
              className={`flex-1 flex items-center justify-center p-2 text-xs font-medium rounded-md ${
                bookmarkView === 'liked'
                  ? 'bg-white text-black shadow-2xs'
                  : 'text-gray-500'
              }`}
              onClick={() => setBookmarkView('liked')}
            >
              좋아요한 북마크
            </button>
          </div>
          {bookmarkView === 'created' && (
            <>
              {created.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full h-40 text-gray-400 border-2 border-dashed border-[#E6E5F2] rounded-lg">
                  <Bookmark className="w-8 h-8 mb-2" />
                  <p className="text-sm">등록된 북마크가 없습니다</p>
                </div>
              ) : (
                <>
                  <div
                    className="flex overflow-x-auto overscroll-contain space-x-2"
                    onWheel={(e) => {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }}
                  >
                    {created.items.map((b) => (
                      <div key={b.bookmarkId}>
                        <SimpleBookmarkCard {...b} />
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-2 px-3 py-1 bg-violet-500 text-white rounded"
                    onClick={() => handleMore(bookmarkView)}
                    disabled={created.loading}
                  >
                    {created.loading ? '불러오는 중...' : '더 보기'}
                  </button>
                </>
              )}
            </>
          )}

          {bookmarkView === 'liked' && (
            <>
              {liked.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full h-40 text-gray-400 border-2 border-dashed border-[#E6E5F2] rounded-lg">
                  <Bookmark className="w-8 h-8 mb-2" />
                  <p className="text-sm">좋아요한 북마크가 없습니다</p>
                </div>
              ) : (
                <>
                  <div
                    className="flex overflow-x-auto overscroll-contain space-x-2"
                    onWheel={(e) => {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }}
                  >
                    {liked.items.map((b) => (
                      <div key={b.bookmarkId}>
                        <SimpleBookmarkCard {...b} />
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-2 px-3 py-1 bg-violet-500 text-white rounded"
                    onClick={() => handleMore(bookmarkView)}
                    disabled={liked.loading}
                  >
                    {liked.loading ? '불러오는 중...' : '더 보기'}
                  </button>
                </>
              )}
            </>
          )}
        </>
      )}
      {confirmOpen === 'profile' && (
        <ConfirmBox
          message="프로필 정보를 저장하시겠습니까?"
          onConfirm={() => {
            handleSaveProfile();
            setConfirmOpen(null);
          }}
          onCancel={() => setConfirmOpen(null)}
        />
      )}

      {confirmOpen === 'password' && (
        <ConfirmBox
          message="비밀번호를 변경하시겠습니까?"
          onConfirm={() => {
            handleChangePassword();
            setConfirmOpen(null);
          }}
          onCancel={() => setConfirmOpen(null)}
        />
      )}

      {confirmOpen === 'logout' && (
        <ConfirmBox
          message="로그아웃 하시겠습니까?"
          onConfirm={() => {
            handleLogout();
            setConfirmOpen(null);
          }}
          onCancel={() => setConfirmOpen(null)}
        />
      )}

      {confirmOpen === 'delete' && (
        <ConfirmBox
          message="정말 계정을 탈퇴하시겠습니까?"
          onConfirm={() => {
            handleDeleteUser();
            setConfirmOpen(null);
          }}
          onCancel={() => setConfirmOpen(null)}
        />
      )}
    </div>
  );
};

export default MyPage;
