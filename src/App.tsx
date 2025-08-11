import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import Main from './Components/Main';
import Modal from './Util/modal';
import CategoryAddModal from './Modal/CategoryAddModal';
import { useAppSelector, useAppDispatch } from './Util/hook';
import { setcategoryAdd } from './Util/modalSlice';

function App() {
  const isCategoryModal = useAppSelector((state) => state.modal.categoryAdd);
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
      <Modal
        isOpen={isCategoryModal}
        onClose={() => dispatch(setcategoryAdd(false))}
      >
        <CategoryAddModal />
      </Modal>
    </>
  );
}

export default App;
