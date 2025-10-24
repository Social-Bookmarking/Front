import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  setOwnershipTransferModal,
  nextOwnershipTransferGroup,
} from '../Util/modalSlice';
import { useState, useEffect } from 'react';
import Avatar from '../Components/Avatar';

const OwnershipTransferModal = () => {
  const dispatch = useAppDispatch();
  const { groups, currentIndex } = useAppSelector(
    (state) => state.modal.ownershipTransferContext
  );
  const current = groups[currentIndex];
  const [members, setMembers] = useState<
    {
      name: string;
      userId: number;
      permission: string;
      profileImageUrl: string | null;
    }[]
  >([]);
  const [selected, setSelected] = useState<number | null>(null);
  const user = useAppSelector((state) => state.user.nickname);

  useEffect(() => {
    if (!current) return;
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `https://www.marksphere.link/api/groups/${current.groupId}/members`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const allMembers = res.data.members || res.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMembers(allMembers.filter((m: any) => m.name !== user));
      } catch (err) {
        console.error(err);
        toast.error('멤버 정보를 불러오지 못했습니다.');
      }
    };
    fetchMembers();
  }, [current]);

  const handleTransfer = async () => {
    if (!selected) return toast.error('새 소유자를 선택해주세요.');

    try {
      await axios.post(
        `https://www.marksphere.link/api/groups/${current.groupId}/transfer-ownership`,
        { newOwnerId: selected },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      toast.success(`"${current.groupName}"의 소유권이 이전되었습니다.`);

      if (currentIndex + 1 < groups.length) {
        dispatch(nextOwnershipTransferGroup());
        setSelected(null);
      } else {
        dispatch(setOwnershipTransferModal({ open: false }));
        await new Promise((r) => setTimeout(r, 500));
        await axios
          .delete('https://www.marksphere.link/api/me', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then(() => {
            localStorage.removeItem('token');
            toast.success('회원탈퇴가 완료되었습니다.');
            window.location.href = '/login';
          });
      }
    } catch (err) {
      console.error(err);
      toast.error('소유권 이전 중 오류가 발생했습니다.');
    }
  };

  if (!current) return null;

  return (
    <div className="w-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-2">
        소유권 이전 ({currentIndex + 1}/{groups.length})
      </h3>
      <p className="text-red-600 text-sm">
        모든 그룹의 소유권을 양도해야 회원탈퇴가 가능합니다.
      </p>
      <p className="text-red-600 text-sm mb-3">
        이전이 완료되면 탈퇴가 자동으로 진행됩니다.
      </p>
      <p className="text-gray-600 text-sm mb-3">
        "{current.groupName}" 그룹의 새 소유자를 선택해주세요.
      </p>
      <div className="mb-3">
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
              {members.map((m) => (
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
      </div>

      <button
        onClick={handleTransfer}
        className="w-full py-2 bg-violet-600 text-white rounded-md"
      >
        {currentIndex + 1 < groups.length ? '소유권 이전' : '모두 완료'}
      </button>
    </div>
  );
};

export default OwnershipTransferModal;
