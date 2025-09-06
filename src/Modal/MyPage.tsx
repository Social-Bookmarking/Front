import { User, LogOut, Settings } from 'lucide-react';

const MyPage = () => {
  return (
    <div className="w-[70vw] max-w-4xl h-[70vh] overflow-y-auto flex flex-col space-y-6">
      {/* 헤더 */}
      <h2 className="text-xl font-semibold text-violet-600 flex items-center gap-2">
        <User className="w-5 h-5" /> 마이페이지
      </h2>

      {/* 프로필 */}
      <div className="border-2 border-[#E6E5F2] rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <p className="font-medium">닉네임</p>
            <p className="text-sm text-gray-500">email@example.com</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg border text-sm flex items-center gap-1 hover:bg-gray-100">
            <Settings className="w-4 h-4" /> 프로필 수정
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm flex items-center gap-1 hover:bg-violet-700">
            <Settings className="w-4 h-4" /> 비밀번호 변경
          </button>
        </div>
      </div>

      {/* 회원 탈퇴 */}
      <div className="border-2 border-[#E6E5F2] rounded-xl p-4">
        <button className="w-full px-3 py-2 rounded-lg bg-red-600 text-white text-sm flex items-center justify-center gap-1 hover:bg-red-700">
          <LogOut className="w-4 h-4" /> 회원 탈퇴
        </button>
      </div>
    </div>
  );
};

export default MyPage;
