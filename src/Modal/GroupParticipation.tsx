import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../Util/hook';
import { setGroupParticipationModal } from '../Util/modalSlice';
import { fetchGroups } from '../Util/groupSlice';

interface GroupInfo {
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
}

const GroupParticipation = () => {
  const dispatch = useAppDispatch();

  const [inviteCode, setInviteCode] = useState('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCheckCode = async (code?: string) => {
    console.log('실행');
    const targetCode = code || inviteCode;
    if (!targetCode.trim()) return toast.error('초대 코드를 입력하세요.');

    setGroupInfo(null);
    setLoading(true);
    try {
      const res = await axios.get(
        `https://www.marksphere.link/api/groups/join?code=${targetCode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setGroupInfo(res.data);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        toast.error('유효하지 않은 초대 코드입니다.');
      } else {
        toast.error('문제가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupInfo) return;

    setJoining(true);
    try {
      await axios.post(
        `https://www.marksphere.link/api/groups/join`,
        { inviteCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      await dispatch(fetchGroups());
      toast.success('그룹에 가입했습니다.');
      dispatch(setGroupParticipationModal(false));
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 409) {
        toast.error('이미 가입한 그룹입니다.');
      } else {
        toast.error('가입에 실패했습니다.');
      }
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    const codeFromQR = localStorage.getItem('inviteCodeFromQR');
    if (codeFromQR) {
      setInviteCode(codeFromQR);
      handleCheckCode(codeFromQR);
      localStorage.removeItem('iviteCodeFromQR');
    }
  }, []);

  return (
    <div className="w-[50vw] max-w-md flex flex-col">
      <h2 className="text-lg font-semibold text-violet-600 mb-4">
        초대 코드로 그룹 참여
      </h2>

      {/* 입력 영역 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="초대 코드를 입력하세요"
          className="flex-1 px-4 py-2 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <button
          onClick={() => handleCheckCode()}
          disabled={loading}
          className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:bg-gray-400"
        >
          {loading ? '조회 중...' : '조회'}
        </button>
      </div>

      {/* 그룹 정보 */}
      {groupInfo && (
        <div className="border border-[#E6E5F2] rounded-lg p-3 mb-4">
          <h3 className="font-bold text-violet-500">{groupInfo.name}</h3>
          <p className="text-sm ">{groupInfo.description}</p>
          <p className="text-xs text-gray-600 mt-1">
            그룹장: {groupInfo.ownerName}
          </p>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => dispatch(setGroupParticipationModal(false))}
          className="px-4 py-2 text-sm border border-[#E6E5F2] rounded-md hover:bg-gray-100"
        >
          취소
        </button>
        <button
          onClick={handleJoinGroup}
          disabled={!groupInfo || joining}
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#7C3BED] hover:bg-violet-700"
        >
          {joining ? '가입 중...' : '그룹 가입'}
        </button>
      </div>
    </div>
  );
};

export default GroupParticipation;
