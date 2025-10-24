import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchGroups,
  selectGroups,
  selectSelectedGroup,
} from '../Util/groupSlice';
import {
  setGroupExitModal,
  setGroupOwnershipTransferModal,
} from '../Util/modalSlice';

const GroupExitModal = () => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectGroups);
  const selectedGroupId = useAppSelector(selectSelectedGroup);
  const selectedGroup = groups.find((g) => g.teamId === selectedGroupId);
  const members = useAppSelector((state) => state.member.memberList);

  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `https://www.marksphere.link/api/groups/${selectedGroupId}/leave`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('그룹에서 탈퇴했습니다.');
      await dispatch(fetchGroups());
      dispatch(setGroupExitModal(false));
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 400) {
        toast.error('마지막 남은 관리자는 탈퇴할 수 없습니다.');
      } else if (err.response?.status === 404) {
        toast.error('그룹 또는 멤버를 찾을 수 없습니다.');
      } else if (err.response?.status === 409) {
        if (members.length <= 1) {
          toast.error(
            '그룹에 현재 한 명만 있습니다. \n 탈퇴 대신 그룹 삭제를 해주세요.'
          );
          return;
        }
        dispatch(setGroupOwnershipTransferModal(true));
      } else {
        toast.error('그룹 탈퇴에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[50vw] max-w-md flex flex-col">
      <h2 className="text-lg font-semibold text-red-600 mb-4">그룹 탈퇴</h2>
      <p className="text-sm text-gray-700 mb-6">
        <span className="font-medium">"{selectedGroup?.groupName}"</span>{' '}
        그룹에서 정말 탈퇴하시겠습니까?
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => dispatch(setGroupExitModal(false))}
          className="px-4 py-2 text-sm border border-[#E6E5F2] rounded-md hover:bg-gray-100"
        >
          취소
        </button>
        <button
          onClick={handleExit}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:bg-gray-400"
        >
          {loading ? '처리 중...' : '그룹 탈퇴'}
        </button>
      </div>
    </div>
  );
};

export default GroupExitModal;
