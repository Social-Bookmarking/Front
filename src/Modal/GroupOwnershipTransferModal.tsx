import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import Avatar from '../Components/Avatar';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  setGroupExitModal,
  setGroupOwnershipTransferModal,
} from '../Util/modalSlice';
import {
  fetchGroups,
  selectGroups,
  selectSelectedGroup,
} from '../Util/groupSlice';

const GroupOwnershipTransferModal = () => {
  const dispatch = useAppDispatch();

  const groups = useAppSelector(selectGroups);
  const selectedGroupId = useAppSelector(selectSelectedGroup);
  const selectedGroup = groups.find((g) => g.teamId === selectedGroupId);

  const [selected, setSelected] = useState<number | null>(null);
  const user = useAppSelector((state) => state.user.nickname);
  const members = useAppSelector((state) => state.member.memberList);

  const handleTransfer = async () => {
    if (!selected) return toast.error('새 소유자를 선택해주세요.');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://www.marksphere.link/api/groups/${selectedGroupId}/transfer-ownership`,
        { newOwnerId: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`"${selectedGroup?.groupName}"의 소유권이 이전되었습니다.`);
      await new Promise((r) => setTimeout(r, 500));

      await axios.delete(
        `https://www.marksphere.link/api/groups/${selectedGroupId}/leave`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`"${selectedGroup?.groupName}" 그룹에서 탈퇴했습니다.`);
      await dispatch(fetchGroups());
      dispatch(setGroupOwnershipTransferModal(false));
      dispatch(setGroupExitModal(false));
    } catch (err) {
      console.error(err);
      toast.error('소유권 이전 중 오류가 발생했습니다.');
    }
  };

  const filteredMembers = members.filter((m) => m.name !== user);

  return (
    <div className="w-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-2">소유권 이전</h3>
      <p className="text-sm text-gray-600 mb-1">
        그룹 탈퇴를 위해 소유권을 다른 멤버에게 이전해야 합니다.
      </p>
      <p className="text-xs text-gray-500 mb-3">
        소유권 이전이 완료되면 자동으로 그룹에서 탈퇴됩니다.
      </p>

      <Listbox value={selected} onChange={(v) => setSelected(v)}>
        <div className="relative">
          <ListboxButton className="w-full flex justify-between items-center h-10 rounded-lg border border-violet-300 bg-white px-3 text-left focus:outline-none focus:ring-2 focus:ring-violet-300">
            <span className="truncate">
              {selected
                ? members.find((m) => m.userId === selected)?.name
                : '소유자 선택'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </ListboxButton>

          <ListboxOptions className="absolute mt-2 z-50 w-full rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none max-h-40 overflow-auto">
            {filteredMembers.map((m) => (
              <ListboxOption
                key={m.userId}
                value={m.userId}
                className="cursor-pointer select-none px-3 py-2 flex items-center gap-2 data-[focus]:bg-violet-50"
              >
                <Avatar
                  name={m.name}
                  src={m.profileImageUrl || undefined}
                  avatarSize={8}
                />
                <span>{m.name}</span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      <button
        onClick={handleTransfer}
        className="w-full mt-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
      >
        소유권 이전 및 그룹 탈퇴
      </button>
    </div>
  );
};

export default GroupOwnershipTransferModal;
