import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import Main from './Components/Main';
import Modal from './Util/modal';
import CategoryAddModal from './Modal/CategoryAddModal';
import MemberSettingsModal from './Modal/MemberSettingsModal';
import { useAppSelector, useAppDispatch } from './Util/hook';
import { setcategoryAdd, setMemberManger } from './Util/modalSlice';

function App() {
  const isCategoryModal = useAppSelector((state) => state.modal.categoryAdd);
  const isMemberModal = useAppSelector((state) => state.modal.memberManager);
  const dispatch = useAppDispatch();

  return (
    <>
      <div className="flex h-screen">
        <div className="sticky">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Main />
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
