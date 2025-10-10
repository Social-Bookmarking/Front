import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';

// 모달
import Modal from './Util/modal';
import CategoryAddModal from './Modal/CategoryAddModal';
import MemberSettingsModal from './Modal/MemberSettingsModal';
import BookmarkAddModal from './Modal/BookmarkAddModal';
import BookmarkMapAddModal from './Modal/BookmarkMapAddModal';
import GroupAddModal from './Modal/GroupAddModal';
import GroupModifyModal from './Modal/GroupModifyModal';
import CommentModal from './Modal/CommentModal';
import MyPage from './Modal/MyPage';
import QRCodeModal from './Modal/QRCodeModal';
import GroupParticipation from './Modal/GroupParticipation';
import GroupDeleteModal from './Modal/GroupDelete';
import GroupExitModal from './Modal/GroupExit';
import BookmarkModifyModal from './Modal/BookmarkModifyModal';

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
} from './Util/modalSlice';
import { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import AuthPage from './AuthPage';

// 동적 import() 지도가 로딩에 많은 영향을 줌
const Main = lazy(() => import('./Components/Main'));
const BookmarkMap = lazy(() => import('./Components/BookmarkMap'));

type View = 'home' | 'map';

function App() {
  const isCategoryModal = useAppSelector((state) => state.modal.categoryAdd);
  const isMemberModal = useAppSelector((state) => state.modal.memberManager);
  const isBookmarkAddModal = useAppSelector((state) => state.modal.bookmarkAdd);
  const isBookmarkMapAddModal = useAppSelector(
    (state) => state.modal.bookmarkMapAdd
  );
  const isGroupAddModal = useAppSelector((state) => state.modal.groupAdd);
  const isGroupModifyModal = useAppSelector((state) => state.modal.groupModify);
  const isCommentModal = useAppSelector((state) => state.modal.commentModal);
  const isMyPage = useAppSelector((state) => state.modal.myPage);
  const isQRCodeModal = useAppSelector((state) => state.modal.QRCodeModal);
  const isGroupParticipation = useAppSelector(
    (state) => state.modal.groupParticipationModal
  );
  const isGroupDeleteModal = useAppSelector(
    (state) => state.modal.groupDeleteModal
  );
  const isGroupExitModal = useAppSelector(
    (state) => state.modal.groupExitModal
  );
  const isBookmarkModifyModal = useAppSelector(
    (state) => state.modal.bookmarkModifyModal
  );

  const dispatch = useAppDispatch();

  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const handleNavigate = useCallback((next: View) => setView(next), []);

  // 최소 5초 로딩 화면
  useEffect(() => {
    const showLoading = () => {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timer);
    };

    const timer = setTimeout(() => setLoading(false), 5000);
    window.addEventListener('reload-loading', showLoading);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('reload-loading', showLoading);
    };
  }, []);

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
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              token ? (
                <>
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
                  {/* 북마크 추가 모달 */}
                  <Modal
                    isOpen={isBookmarkAddModal}
                    onClose={() => dispatch(setBookMarkAdd(false))}
                  >
                    <BookmarkAddModal />
                  </Modal>

                  {/* 카테고리 추가 모달 */}
                  <Modal
                    isOpen={isCategoryModal}
                    onClose={() => dispatch(setcategoryAdd(false))}
                  >
                    <CategoryAddModal />
                  </Modal>
                  {/* 멤버 관리 모달 */}
                  <Modal
                    isOpen={isMemberModal}
                    onClose={() => dispatch(setMemberManger(false))}
                  >
                    <MemberSettingsModal />
                  </Modal>

                  {/* 맵 북마크 추가 모달 */}
                  <Modal
                    isOpen={isBookmarkMapAddModal}
                    onClose={() => dispatch(setBookMarkMapAdd({ open: false }))}
                  >
                    <BookmarkMapAddModal />
                  </Modal>

                  {/* 그룹 추가 모달 */}
                  <Modal
                    isOpen={isGroupAddModal}
                    onClose={() => dispatch(setGroupAdd(false))}
                  >
                    <GroupAddModal />
                  </Modal>

                  {/* 그룹 수정 모달 */}
                  <Modal
                    isOpen={isGroupModifyModal}
                    onClose={() => dispatch(setGroupModify(false))}
                  >
                    <GroupModifyModal />
                  </Modal>

                  {/* 댓글창 모달 */}
                  <Modal
                    isOpen={isCommentModal}
                    onClose={() => dispatch(setCommentModal({ open: false }))}
                  >
                    <CommentModal />
                  </Modal>

                  {/* 마이페이지 */}
                  <Modal
                    isOpen={isMyPage}
                    onClose={() => dispatch(setMyPage(false))}
                  >
                    <MyPage />
                  </Modal>

                  {/* QR 초대 모달 */}
                  <Modal
                    isOpen={isQRCodeModal}
                    onClose={() => dispatch(setQRcodeModal(false))}
                  >
                    <QRCodeModal />
                  </Modal>

                  {/* 그룹 초대 모달 */}
                  <Modal
                    isOpen={isGroupParticipation}
                    onClose={() => dispatch(setGroupParticipationModal(false))}
                  >
                    <GroupParticipation />
                  </Modal>

                  {/* 그룹 삭제 모달 */}
                  <Modal
                    isOpen={isGroupDeleteModal}
                    onClose={() => dispatch(setGroupDeleteModal(false))}
                  >
                    <GroupDeleteModal />
                  </Modal>

                  {/* 그룹 탈퇴 모달 */}
                  <Modal
                    isOpen={isGroupExitModal}
                    onClose={() => dispatch(setGroupExitModal(false))}
                  >
                    <GroupExitModal />
                  </Modal>

                  {/* 북마크 수정 모달 */}
                  <Modal
                    isOpen={isBookmarkModifyModal}
                    onClose={() =>
                      dispatch(setBookMarkModifyModal({ open: false }))
                    }
                  >
                    <BookmarkModifyModal />
                  </Modal>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>

      {/* 로딩 애니메이션 */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-3 h-3 bg-violet-500 rounded-full"
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
