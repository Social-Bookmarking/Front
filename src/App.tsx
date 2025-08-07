import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Main from './components/Main';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <Main />
      </div>
    </div>
  );
}

export default App;
