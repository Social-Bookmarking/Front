import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  // 마우스 로딩
  const setGlobalCursor = (type: 'wait' | 'default') => {
    document.body.style.cursor = type;
  };

  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (tab === 'login') {
  //     try {
  //       const res = await axios.post(
  //         'https://www.marksphere.link/api/auth/test',
  //         {}
  //       );
  //       localStorage.setItem('token', res.data.accessToken);
  //       window.dispatchEvent(new Event('storage'));
  //       window.dispatchEvent(new Event('reload-loading'));
  //       navigate('/');
  //     } catch (err) {
  //       console.error('axios 에러:', err);
  //     }
  //   } else {
  //     setTab('login');
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      toast.error('아이디를 입력해주세요');
      return;
    }

    if (!password.trim()) {
      toast.error('비밀번호를 입력해주세요');
      return;
    }

    if (password.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }

    if (tab === 'login') {
      try {
        setGlobalCursor('wait');
        const res = await axios.post(
          'https://www.marksphere.link/api/auth/login',
          { username: nickname, password },
          { withCredentials: true }
        );
        console.log(res);

        localStorage.setItem('token', res.data.accessToken);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('reload-loading'));

        const pendingCode = localStorage.getItem('pendingInviteCode');
        if (pendingCode) {
          localStorage.removeItem('pendingIviteCode');
          navigate(`/group/qr/join?code=${pendingCode}`);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('axios 에러:', err);
        toast.error('로그인에 실패했습니다.\n 다시 시도해주세요.');
      } finally {
        setGlobalCursor('default');
      }
    } else {
      if (password !== passwordConfirm) {
        toast.error('비밀번호가 일치하지 않습니다.');
        return;
      }

      try {
        setGlobalCursor('wait');
        await axios.post('https://www.marksphere.link/api/auth/register', {
          username: nickname,
          password,
          nickname,
        });

        toast.success('회원가입 성공! 로그인 해주세요.');
        setTab('login');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 400) {
            toast.error('이미 사용 중인 아이디입니다.');
          } else {
            toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
          }
        }
      } finally {
        setGlobalCursor('default');
      }
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
            <label className="block text-sm font-medium mb-1">아이디</label>
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              className="w-full border border-[#E6E5F2] rounded-md p-2 focus:ring focus:ring-blue-200"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                className="w-full border border-[#E6E5F2] rounded-md p-2 focus:ring focus:ring-blue-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="비밀번호 확인"
                  className="w-full border border-[#E6E5F2] rounded-md p-2 focus:ring focus:ring-blue-200"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                >
                  {showPasswordConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          )}

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
