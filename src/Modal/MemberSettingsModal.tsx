import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Trash2, ChevronDown, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../Util/hook';
import { setMemberManger, setQRcodeModal } from '../Util/modalSlice';
import { changeRole } from '../Util/memberSlice';
import Avatar from '../Components/Avatar';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { selectSelectedGroup } from '../Util/groupSlice';
import axios from 'axios';

import { useFloating, flip, shift, offset } from '@floating-ui/react';

type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '관리자',
  EDITOR: '편집자',
  VIEWER: '뷰어',
};

// 각 컴포넌트 마다 훅 적용
const MemberRow = ({
  member,
  onChangeRole,
  onRemove,
  ownerId,
}: {
  member: {
    userId: number;
    name: string;
    email: string | null;
    profileImageUrl: string | null;
    permission: Role;
  };
  onChangeRole: (id: number, role: Role) => void;
  onRemove: (id: number) => void;
  ownerId: number | null;
}) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [flip(), shift(), offset(4)],
  });

  const isOwner = member.userId === ownerId;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-violet-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={member.name} src={member.profileImageUrl ?? ''} />
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {member.name}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {member.email ?? '이메일 없음'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-between">
        <div className="relative min-w-30">
          <Listbox
            value={member.permission}
            onChange={(role: Role) => onChangeRole(member.userId, role)}
            disabled={isOwner}
          >
            <ListboxButton
              ref={refs.setReference}
              className="w-full flex justify-between items-center h-10 rounded-lg border border-violet-300 bg-white px-3 text-left focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <span className="truncate">{ROLE_LABEL[member.permission]}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </ListboxButton>

            <ListboxOptions
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-50 w-full rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none max-h-20 overflow-auto"
            >
              {(Object.keys(ROLE_LABEL) as Role[]).map((role) => (
                <ListboxOption
                  key={role}
                  value={role}
                  className="cursor-pointer select-none px-3 py-2 data-[focus]:bg-violet-50"
                >
                  {ROLE_LABEL[role]}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
        </div>

        <button
          onClick={() => onRemove(member.userId)}
          className={`p-2 rounded-lg ${
            isOwner ? 'cursor-not-allowed opacity-30' : 'hover:bg-rose-50'
          }`}
          aria-label="멤버 삭제"
          disabled={isOwner}
        >
          <Trash2 className="w-5 h-5 text-rose-500" />
        </button>
      </div>
    </div>
  );
};

const MemberSettingsModal = () => {
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.member.memberList);
  const groupId = useAppSelector(selectSelectedGroup);

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [ownerId, setOwnerId] = useState<number | null>(null);

  useEffect(() => {
    const fetchGroupDetail = async () => {
      if (!groupId) return;
      try {
        const res = await axios.get(
          `https://www.marksphere.link/api/groups/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setOwnerId(res.data.ownerId);
      } catch (err) {
        console.error('그룹 상세 조회 실패', err);
      }
    };

    fetchGroupDetail();
  }, [groupId]);

  const handleGenerateCode = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `https://www.marksphere.link/api/groups/${groupId}/invite-code`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setInviteCode(res.data.code);
    } catch (err) {
      console.error('초대 코드 생성 실패', err);
      toast.error('오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    toast.success('초대 코드가 복사되었습니다.');
  };

  const handleChangeRole = (id: number, role: Role) => {
    if (!groupId) return;
    dispatch(changeRole({ groupId, memberId: id, role }));
  };

  const handleRemove = (id: number) => {
    console.log('remove', id);
  };

  return (
    <div className="w-[50vw]">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            워크스페이스 멤버 관리
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            멤버 초대와 역할을 관리하세요.
          </p>
        </div>
      </div>

      {/* 초대 영역 */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border-2 border-[#E6E5F2] rounded-lg p-4 flex flex-col items-center gap-3">
          <h3 className="font-medium text-gray-800">초대 코드</h3>
          {inviteCode ? (
            <>
              <p className="text-lg font-mono text-violet-600">{inviteCode}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-md bg-violet-600 text-white text-xs hover:bg-violet-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> 복사
                </button>
                <button
                  onClick={handleGenerateCode}
                  disabled={loading}
                  className="px-3 py-1 rounded-md border border-[#E6E5F2] text-xs hover:bg-gray-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {loading ? '발급 중...' : '재발급'}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 text-sm"
            >
              {loading ? '발급 중...' : '코드 생성'}
            </button>
          )}
        </div>

        <div className="border-2 border-[#E6E5F2] rounded-lg p-4 flex flex-col items-center justify-center gap-">
          <h3 className="font-medium text-gray-800">QR 코드 초대</h3>
          <button
            onClick={() => dispatch(setQRcodeModal(true))}
            className="px-4 py-2 rounded-md border border-[#E6E5F2] text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            QR 보기
          </button>
        </div>
      </div>

      {/* 현재 멤버 리스트 */}
      <div className="mt-6 space-y-3 h-60 overflow-y-auto scrollbar-hidden">
        {members.map((m) => (
          <MemberRow
            key={m.userId}
            member={m}
            onChangeRole={handleChangeRole}
            onRemove={handleRemove}
            ownerId={ownerId}
          />
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-6 gap-2 flex justify-end">
        <button
          className="h-10 px-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          onClick={() => dispatch(setMemberManger(false))}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default MemberSettingsModal;
