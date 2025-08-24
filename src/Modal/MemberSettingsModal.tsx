import { useState, useEffect } from 'react';
import { MailPlus, Trash2, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../Util/hook';
import { setMemberManger } from '../Util/modalSlice';
import { fetchMembers, changeRole } from '../Util/memberSlice';
import Avatar from '../Components/Avatar';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';

type Role = 'owner' | 'admin' | 'editor' | 'viewer';

const ROLE_LABEL: Record<Role, string> = {
  owner: '소유자',
  admin: '관리자',
  editor: '편집자',
  viewer: '뷰어',
};

const MemberSettingsModal = () => {
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.member.memberList);
  const status = useAppSelector((state) => state.member.status);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchMembers());
  }, [dispatch, status]);

  // 초대 상태
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');

  // TODO: inviteMember thunk와 연결
  const handleInvite = () => {
    console.log('invite', inviteEmail, inviteRole);
    // dispatch(inviteMember({ email: inviteEmail, role: inviteRole }))
    //   .unwrap()
    //   .then(() => setInviteEmail(''));
  };

  // TODO: updateMemberRole / removeMember thunk와 연결
  const handleChangeRole = (id: string, role: string) => {
    console.log('change-role', id, role);
    dispatch(changeRole({ id, role }));
  };
  const handleRemove = (id: string) => {
    console.log('remove', id);
    // dispatch(removeMemberAsync({ id }));
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
      <div className="mt-4 grid items-center gap-3 md:flex md:itmes-center">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="이메일 주소"
          className="flex-1 h-11 px-4 rounded-lg border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
        />
        <div className="relative min-w-25">
          <Listbox value={inviteRole} onChange={setInviteRole}>
            <ListboxButton className="flex justify-between items-center w-full h-11 rounded-lg border border-violet-300 bg-white px-3 text-left focus:outline-none focus:ring-2 focus:ring-violet-300">
              <span className="truncate">{ROLE_LABEL[inviteRole]}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </ListboxButton>
            <ListboxOptions className="absolute z-50 mt-1 w-full rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none overflow-hidden">
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
          onClick={handleInvite}
          className="h-11 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white inline-flex items-center gap-2"
        >
          <MailPlus className="w-4 h-4" />
          초대
        </button>
      </div>

      {/* 현재 멤버 리스트 */}
      <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-violet-100 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={m.name} src={m.profile} />
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {m.name}
                </div>
                <div className="text-sm text-gray-500 truncate">{m.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:justify-between">
              <div className="relative min-w-30">
                <Listbox
                  value={m.role}
                  onChange={(role: Role) =>
                    handleChangeRole(m.id, ROLE_LABEL[role])
                  }
                >
                  <ListboxButton className="w-full flex justify-between items-center h-10 rounded-lg border border-violet-300 bg-white px-3 text-left focus:outline-none focus:ring-2 focus:ring-violet-300">
                    <span className="truncate">{m.role}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </ListboxButton>

                  {/* anchor 제거, absolute로 고정 */}
                  <ListboxOptions className="absolute z-50 mt-1 w-full rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none max-h-20 overflow-auto">
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
                onClick={() => handleRemove(m.id)}
                className="p-2 rounded-lg hover:bg-rose-50"
                aria-label="멤버 삭제"
              >
                <Trash2 className="w-5 h-5 text-rose-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-6 flex justify-end">
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
