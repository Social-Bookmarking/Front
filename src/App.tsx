import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import GroupQrJoinPage from './Components/GroupQrJoinPage';
import ModalLoading from './Components/ModalLoading';
import { useAppSelector, useAppDispatch } from './Util/hook';
import {
  setcategoryAdd,
  setMemberManger,
  setBookMarkAdd,
  setBookMarkMapAdd,
  setGroupAdd,
  setGroupModify,
  setCommentModal,
  setMyPage,
  setQRcodeModal,
  setGroupParticipationModal,
  setGroupDeleteModal,
  setGroupExitModal,
  setBookMarkModifyModal,
  setOwnershipTransferModal,
  setGroupOwnershipTransferModal,
} from './Util/modalSlice';
import { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import AppInitializer from './Components/AppInitializer';

// 모달
import Modal from './Util/modal';
const CategoryAddModal = lazy(() => import('./Modal/CategoryAddModal'));
const MemberSettingsModal = lazy(() => import('./Modal/MemberSettingsModal'));
const BookmarkAddModal = lazy(() => import('./Modal/BookmarkAddModal'));
const BookmarkMapAddModal = lazy(() => import('./Modal/BookmarkMapAddModal'));
const GroupAddModal = lazy(() => import('./Modal/GroupAddModal'));
const GroupModifyModal = lazy(() => import('./Modal/GroupModifyModal'));
const CommentModal = lazy(() => import('./Modal/CommentModal'));
const MyPage = lazy(() => import('./Modal/MyPage'));
const QRCodeModal = lazy(() => import('./Modal/QRCodeModal'));
const GroupParticipation = lazy(() => import('./Modal/GroupParticipation'));
const GroupDeleteModal = lazy(() => import('./Modal/GroupDelete'));
const GroupExitModal = lazy(() => import('./Modal/GroupExit'));
const BookmarkModifyModal = lazy(() => import('./Modal/BookmarkModifyModal'));
const OwnershipTransferModal = lazy(
  () => import('./Modal/OwnershipTransferModal'),
);
const GroupOwnershipTransferModal = lazy(
  () => import('./Modal/GroupOwnershipTransferModal'),
);

// 동적 import() 지도가 로딩에 많은 영향을 줌
const Main = lazy(() => import('./Components/Main'));
const BookmarkMap = lazy(() => import('./Components/BookmarkMap'));
const AuthPage = lazy(() => import('./AuthPage'));

type View = 'home' | 'map';

function App() {
  const isCategoryModal = useAppSelector((state) => state.modal.categoryAdd);
  const isMemberModal = useAppSelector((state) => state.modal.memberManager);
  const isBookmarkAddModal = useAppSelector((state) => state.modal.bookmarkAdd);
  const isBookmarkMapAddModal = useAppSelector(
    (state) => state.modal.bookmarkMapAdd,
  );
  const isGroupAddModal = useAppSelector((state) => state.modal.groupAdd);
  const isGroupModifyModal = useAppSelector((state) => state.modal.groupModify);
  const isCommentModal = useAppSelector((state) => state.modal.commentModal);
  const isMyPage = useAppSelector((state) => state.modal.myPage);
  const isQRCodeModal = useAppSelector((state) => state.modal.QRCodeModal);
  const isGroupParticipation = useAppSelector(
    (state) => state.modal.groupParticipationModal,
  );
  const isGroupDeleteModal = useAppSelector(
    (state) => state.modal.groupDeleteModal,
  );
  const isGroupExitModal = useAppSelector(
    (state) => state.modal.groupExitModal,
  );
  const isBookmarkModifyModal = useAppSelector(
    (state) => state.modal.bookmarkModifyModal,
  );
  const isOwnershipTransferModal = useAppSelector(
    (state) => state.modal.ownershipTransferModal,
  );
  const isGroupOwnershipTransferModal = useAppSelector(
    (state) => state.modal.groupOwnershipTransperModal,
  );

  const dispatch = useAppDispatch();

  const [view, setView] = useState<View>('home');
  // const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );
  const handleNavigate = useCallback((next: View) => setView(next), []);

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={null}>
                <AuthPage />
              </Suspense>
            }
          />
          <Route path="/group/qr/join" element={<GroupQrJoinPage />} />
          <Route
            path="/*"
            element={
              token ? (
                <>
                  <AppInitializer>
                    <div className="flex bg-gray-50 min-h-screen">
                      <div className="sticky">
                        <Sidebar view={view} onNavigate={handleNavigate} />
                      </div>
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <Header />
                        <main className="flex-1 overflow-y-auto">
                          <Suspense
                            fallback={<div className="p-6">로딩 중...</div>}
                          >
                            {view === 'home' ? <Main /> : <BookmarkMap />}
                          </Suspense>
                        </main>
                      </div>
                    </div>
                  </AppInitializer>
                  {/* 북마크 추가 모달 */}
                  <Modal
                    isOpen={isBookmarkAddModal}
                    onClose={() => dispatch(setBookMarkAdd(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isBookmarkAddModal && <BookmarkAddModal />}
                    </Suspense>
                  </Modal>

                  {/* 카테고리 추가 모달 */}
                  <Modal
                    isOpen={isCategoryModal}
                    onClose={() => dispatch(setcategoryAdd(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isCategoryModal && <CategoryAddModal />}
                    </Suspense>
                  </Modal>
                  {/* 멤버 관리 모달 */}
                  <Modal
                    isOpen={isMemberModal}
                    onClose={() => dispatch(setMemberManger(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isMemberModal && <MemberSettingsModal />}
                    </Suspense>
                  </Modal>

                  {/* 맵 북마크 추가 모달 */}
                  <Modal
                    isOpen={isBookmarkMapAddModal}
                    onClose={() => dispatch(setBookMarkMapAdd({ open: false }))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isBookmarkMapAddModal && <BookmarkMapAddModal />}
                    </Suspense>
                  </Modal>

                  {/* 그룹 추가 모달 */}
                  <Modal
                    isOpen={isGroupAddModal}
                    onClose={() => dispatch(setGroupAdd(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isGroupAddModal && <GroupAddModal />}
                    </Suspense>
                  </Modal>

                  {/* 그룹 수정 모달 */}
                  <Modal
                    isOpen={isGroupModifyModal}
                    onClose={() => dispatch(setGroupModify(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isGroupModifyModal && <GroupModifyModal />}
                    </Suspense>
                  </Modal>

                  {/* 댓글창 모달 */}
                  <Modal
                    isOpen={isCommentModal}
                    onClose={() => dispatch(setCommentModal({ open: false }))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isCommentModal && <CommentModal />}
                    </Suspense>
                  </Modal>

                  {/* 마이페이지 */}
                  <Modal
                    isOpen={isMyPage}
                    onClose={() => dispatch(setMyPage(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isMyPage && <MyPage />}
                    </Suspense>
                  </Modal>

                  {/* QR 초대 모달 */}
                  <Modal
                    isOpen={isQRCodeModal}
                    onClose={() => dispatch(setQRcodeModal(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isQRCodeModal && <QRCodeModal />}
                    </Suspense>
                  </Modal>

                  {/* 그룹 초대 모달 */}
                  <Modal
                    isOpen={isGroupParticipation}
                    onClose={() => dispatch(setGroupParticipationModal(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isGroupParticipation && <GroupParticipation />}
                    </Suspense>
                  </Modal>

                  {/* 그룹 삭제 모달 */}
                  <Modal
                    isOpen={isGroupDeleteModal}
                    onClose={() => dispatch(setGroupDeleteModal(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isGroupDeleteModal && <GroupDeleteModal />}
                    </Suspense>
                  </Modal>

                  {/* 그룹 탈퇴 모달 */}
                  <Modal
                    isOpen={isGroupExitModal}
                    onClose={() => dispatch(setGroupExitModal(false))}
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isGroupExitModal && <GroupExitModal />}
                    </Suspense>
                  </Modal>

                  {/* 북마크 수정 모달 */}
                  <Modal
                    isOpen={isBookmarkModifyModal}
                    onClose={() =>
                      dispatch(setBookMarkModifyModal({ open: false }))
                    }
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isBookmarkModifyModal && <BookmarkModifyModal />}
                    </Suspense>
                  </Modal>

                  {/* 회원탈퇴 전 소유자 이전 */}
                  <Modal
                    isOpen={isOwnershipTransferModal}
                    onClose={() =>
                      dispatch(setOwnershipTransferModal({ open: false }))
                    }
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isOwnershipTransferModal && <OwnershipTransferModal />}
                    </Suspense>
                  </Modal>
                  <Modal
                    isOpen={isGroupOwnershipTransferModal}
                    onClose={() =>
                      dispatch(setGroupOwnershipTransferModal(false))
                    }
                  >
                    <Suspense fallback={<ModalLoading />}>
                      {isGroupOwnershipTransferModal && (
                        <GroupOwnershipTransferModal />
                      )}
                    </Suspense>
                  </Modal>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
