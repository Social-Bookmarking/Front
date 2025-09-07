import { useState } from 'react';
import { useAppDispatch } from '../Util/hook';
import { setGroupAdd } from '../Util/modalSlice';
import { fetchGroups } from '../Util/groupSlice';
import axios from 'axios';

const GroupAddModal = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useAppDispatch();

  const handleSave = async () => {
    if (!groupName.trim()) return alert('그룹명을 입력해주세요.');
    try {
      await axios.post(
        `https://www.marksphere.link/api/groups`,
        {
          name: groupName,
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      await dispatch(fetchGroups());
    } catch (err) {
      console.log(err);
    }
    dispatch(setGroupAdd(false));
  };

  return (
    <div className="w-[50vw] max-w-md rounded-2xl space-y-5 relative">
      <h2 className="text-lg font-semibold text-violet-600">새 그룹 추가</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          그룹명
        </label>
        <input
          type="text"
          placeholder="예: 디자인팀"
          onChange={(e) => {
            const val = e.target.value;
            setGroupName(val.slice(0, 20));
          }}
          value={groupName}
          className="w-full px-4 py-2 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          그룹 설명
        </label>
        <input
          type="text"
          placeholder="예: UI/UX 디자이너들이 모인 공간"
          onChange={(e) => {
            const val = e.target.value;
            setDescription(val.slice(0, 50));
          }}
          value={description}
          className="w-full px-4 py-2 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={() => dispatch(setGroupAdd(false))}
          className="px-4 py-2 rounded-md text-sm border border-[#E6E5F2] text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#7C3BED] hover:bg-violet-700"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default GroupAddModal;
