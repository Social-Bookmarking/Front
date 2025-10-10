import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { store } from './Util/store';
import { Provider } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      console.log('함수 작동');

      if (status === 401) {
        // 로그인 요청에서 난 401은 그대로 reject
        if (error.config?.url?.includes('/auth/login')) {
          return Promise.reject(error);
        }

        if (error.config?.url?.includes('/auth/reissue')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const refreshRes = await axios.post(
            'https://www.marksphere.link/api/auth/reissue',
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              withCredentials: true,
            } // 쿠키 포함
          );
          const newAccessToken = refreshRes.data.accessToken;
          localStorage.setItem('token', newAccessToken);

          // 원래 요청 다시 시도
          if (error.config) {
            const newConfig = {
              ...error.config,
              headers: {
                ...(error.config.headers || {}),
                Authorization: `Bearer ${newAccessToken}`,
              },
            };
            return axios(newConfig);
          }
        } catch (err) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      } else if (status === 403) {
        toast.error('권한이 없습니다.');
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Toaster position="top-center" reverseOrder={false} />
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);
