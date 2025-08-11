import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { store } from './Util/store';
import { Provider } from 'react-redux';

// 나중에 수정 (목 데이터)
import { setupCategoryMock } from './Mocks/categories.ts';
setupCategoryMock();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);
