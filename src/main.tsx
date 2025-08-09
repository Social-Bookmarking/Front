import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// 나중에 수정 (목 데이터)
import { setupCategoryMock } from './mocks/categories';
setupCategoryMock();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
