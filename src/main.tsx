import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { store } from './Util/store';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// 나중에 수정 (목 데이터)
import { setupMocks } from './Mocks/mock.ts';
setupMocks();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Toaster position="top-center" reverseOrder={false} />
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);
