import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';

// 모달
import Modal from './Util/modal';
import CategoryAddModal from './Modal/CategoryAddModal';
import MemberSettingsModal from './Modal/MemberSettingsModal';
import BookmarkAddModal from './Modal/BookmarkAddModal';

import { useAppSelector, useAppDispatch } from './Util/hook';
import {
  setcategoryAdd,
  setMemberManger,
  setBookMarkAdd,
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
  const dispatch = useAppDispatch();

  const [view, setView] = useState<View>('home');
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            token ? (
              <>
                <div className="flex h-screen">
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

                {/* 설정 모달 */}
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
