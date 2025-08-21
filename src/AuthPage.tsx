import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      try {
        const res = await axios.post(
          'http://www.marksphere.link:8080/api/auth/test',
          {}
        );
        console.log(res.data.accessToken);
        localStorage.setItem('token', res.data.accessToken);
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      } catch (err) {
        console.error('axios 에러:', err);
      }
    } else {
      setTab('login');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white shadow-md rounded-lg p-8 w-120 border border-[#E6E5F2]">
        <h2 className="text-2xl font-bold text-center mb-4">계정</h2>
        <p className="text-center text-gray-500 mb-4">
          로그인하거나 새 계정을 만드세요
        </p>
        <div className="flex mb-6 rounded-md overflow-hidden p-1 bg-gray-100">
          <button
            className={`flex-1 p-2 text-sm font-medium rounded-md ${
              tab === 'login'
                ? 'bg-white text-black shadow-2xs'
                : 'text-gray-500'
            }`}
            onClick={() => setTab('login')}
          >
            로그인
          </button>
          <button
            className={`flex-1 p-2 text-sm font-medium rounded-md ${
              tab === 'register'
                ? 'bg-white text-black shadow-2xs'
                : 'text-gray-500'
            }`}
            onClick={() => setTab('register')}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="w-full  border border-[#E6E5F2] rounded-md p-2 focus:ring focus:ring-blue-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="w-full  border border-[#E6E5F2] rounded-md p-2 focus:ring focus:ring-blue-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md"
          >
            {tab === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
