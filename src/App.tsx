import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Main from './components/Main';
import { store } from './Util/store';
import { Provider } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <Main />
        </div>
      </div>
    </Provider>
  );
}

export default App;
