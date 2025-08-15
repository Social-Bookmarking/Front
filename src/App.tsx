import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import Modal from './Util/modal';
import CategoryAddModal from './Modal/CategoryAddModal';
import MemberSettingsModal from './Modal/MemberSettingsModal';
import { useAppSelector, useAppDispatch } from './Util/hook';
import { setcategoryAdd, setMemberManger } from './Util/modalSlice';
import { useState, lazy, Suspense, useCallback } from 'react';

// 동적 import() 지도가 로딩에 많은 영향을 줌
const Main = lazy(() => import('./Components/Main'));
const BookmarkMap = lazy(() => import('./Components/BookmarkMap'));

type View = 'home' | 'map';

function App() {
  const isCategoryModal = useAppSelector((state) => state.modal.categoryAdd);
  const isMemberModal = useAppSelector((state) => state.modal.memberManager);
  const dispatch = useAppDispatch();

  const [view, setView] = useState<View>('home');
  const handleNavigate = useCallback((next: View) => setView(next), []);

  return (
    <>
      <div className="flex h-screen">
        <div className="sticky">
          <Sidebar view={view} onNavigate={handleNavigate} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<div className="p-6">로딩 중...</div>}>
              {view === 'home' ? <Main /> : <BookmarkMap />}
            </Suspense>
          </main>
        </div>
      </div>

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
  );
}

export default App;
