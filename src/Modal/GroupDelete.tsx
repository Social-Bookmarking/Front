import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchGroups,
  selectGroups,
  selectSelectedGroup,
} from '../Util/groupSlice';
import { setGroupDeleteModal } from '../Util/modalSlice';
import { fetchGroupDetail } from '../Util/groupDetailSlice';

const GroupDeleteModal = () => {
  const dispatch = useAppDispatch();

  const groups = useAppSelector(selectGroups);
  const selectedGroupId = useAppSelector(selectSelectedGroup);
  const selectedGroup = groups.find((g) => g.teamId === selectedGroupId);

  const groupDetail = useAppSelector((state) => state.groupDetail.detail); // ✅ status 가져오기
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `https://www.marksphere.link/api/groups/${selectedGroupId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('그룹 삭제 요청 성공');
      await dispatch(fetchGroups());
      if (selectedGroupId !== null) {
        await dispatch(fetchGroupDetail(selectedGroupId));
      }
      dispatch(setGroupDeleteModal(false));
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 404) {
        toast.error('그룹을 찾을 수 없습니다.');
      } else {
        toast.error('삭제 요청에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setLoading(true);
    try {
      await axios.post(
        `https://www.marksphere.link/api/groups/${selectedGroupId}/cancel-deletion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('그룹 삭제가 취소되었습니다.');
      await dispatch(fetchGroups());
      if (selectedGroupId !== null) {
        await dispatch(fetchGroupDetail(selectedGroupId));
      }
      dispatch(setGroupDeleteModal(false));
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 403) {
        toast.error('삭제 취소 권한이 없습니다.');
      } else if (err.response?.status === 404) {
        toast.error('그룹을 찾을 수 없습니다.');
      } else {
        toast.error('삭제 취소에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isPendingDeletion = groupDetail?.status === 'PENDING_DELETION';

  return (
    <div className="w-[50vw] max-w-md flex flex-col">
      <h2
        className={`text-lg font-semibold mb-4 ${
          isPendingDeletion ? 'text-orange-600' : 'text-red-600'
        }`}
      >
        {isPendingDeletion ? '그룹 삭제 취소' : '그룹 삭제 요청'}
      </h2>

      {!isPendingDeletion ? (
        <>
          <p className="text-sm text-gray-700">
            <span className="font-medium">"{selectedGroup?.groupName}"</span>{' '}
            그룹을 정말 삭제하시겠습니까?
          </p>
          <p className="text-sm text-gray-700">
            삭제는 일주일 뒤에 진행되며, 그 전까지는 취소할 수 있습니다.
          </p>
          <p className="text-sm text-gray-700 mb-6">
            삭제된 그룹은 복구가 불가능합니다.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-700">
            <span className="font-medium">"{selectedGroup?.groupName}"</span>{' '}
            그룹의 삭제가 요청된 상태입니다.
          </p>
          <p className="text-sm text-gray-700 mb-6">
            정말 삭제 요청을 취소하시겠습니까?
          </p>
        </>
      )}

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => dispatch(setGroupDeleteModal(false))}
          className="px-4 py-2 text-sm border border-[#E6E5F2] rounded-md hover:bg-gray-100"
        >
          닫기
        </button>

        {!isPendingDeletion ? (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? '처리 중...' : '삭제 요청'}
          </button>
        ) : (
          <button
            onClick={handleCancelDeletion}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:bg-gray-400"
          >
            {loading ? '처리 중...' : '삭제 취소'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupDeleteModal;
