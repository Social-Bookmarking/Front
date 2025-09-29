import {
  FolderOpen,
  Users,
  Settings,
  Plus,
  Home,
  Map,
  ChevronDown,
  LogIn,
  PlusCircle,
  Pencil,
  Trash2,
  LogOut,
  User,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchCategories,
  selectCategories,
  selectSelectedId,
  selectCategory,
} from '../Util/categorySlice';
import {
  setcategoryAdd,
  setMemberManger,
  setGroupAdd,
  setGroupModify,
  setMyPage,
  setGroupParticipationModal,
  setGroupDeleteModal,
  setGroupExitModal,
} from '../Util/modalSlice';
import {
  fetchGroups,
  selectGroups,
  selectSelectedGroup,
  changeGroup,
} from '../Util/groupSlice';
import { fetchMembers } from '../Util/memberSlice';
import { fetchUserInfo } from '../Util/user';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import Avatar from './Avatar';

type View = 'home' | 'map';
interface SidebarProps {
  view: View;
  onNavigate: (v: View) => void;
}

const Sidebar = ({ view, onNavigate }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const selectedId = useAppSelector(selectSelectedId);
  const groups = useAppSelector(selectGroups);
  const selectedGroupId = useAppSelector(selectSelectedGroup);
  const selectedGroup = groups.find((g) => g.teamId === selectedGroupId);
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchUserInfo());
  }, [dispatch]);

  useEffect(() => {
    if (selectedGroupId) {
      dispatch(fetchMembers(selectedGroupId));
      dispatch(fetchCategories(selectedGroupId));
    }
  }, [dispatch, selectedGroupId]);

  return (
    <aside className="w-64 h-full p-4 border-r-2 border-[#E6E5F2] bg-[#fafafa] flex flex-col">
      <div className="flex border-b-2 border-[#E6E5F2] px-3 pb-3 items-center w-full mb-6">
        <Avatar name={user.nickname} src={user.profileImageUrl} />
        <div className="flex flex-col pl-3">
          <p className="font-bold truncate">{user.nickname}</p>
        </div>
      </div>
      {/* 북마크스페이스 타이틀 */}
      <div className="mb-2">
        <Listbox
          value={selectedGroupId ?? 0}
          onChange={(id) => dispatch(changeGroup(id))}
        >
          <div className="relative">
            <ListboxButton className="flex items-center justify-between w-full px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-violet-300">
              <span className="flex items-center gap-2 font-semibold text-gray-800 ">
                <FolderOpen className="w-5 h-5 text-violet-500" />
                <span
                  className="block max-w-[160px] truncate"
                  title={selectedGroup?.groupName ?? '북마크 스페이스'}
                >
                  {selectedGroup?.groupName ?? '북마크 스페이스'}
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </ListboxButton>

            <ListboxOptions className="absolute z-50 mt-1 w-full max-h-[280px] overflow-y-auto rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none overflow-hidden">
              {groups.map((g) => (
                <ListboxOption
                  key={g.teamId}
                  value={g.teamId}
                  className="cursor-pointer select-none px-3 py-2 data-[focus]:bg-violet-50"
                >
                  <div className="flex flex-col">
                    <span className="block max-w-[180px] break-words font-medium text-gray-800">
                      {g.groupName}
                    </span>
                    {g.description && (
                      <span className="block max-w-[180px] break-words text-xs text-gray-500">
                        {g.description}
                      </span>
                    )}
                  </div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {/* 멤버 관리 & 설정 */}
      <div className="space-y-2 ml-2 mb-8">
        <button
          className={`flex items-center gap-2 text-sm w-full px-3 py-2 rounded ${
            view === 'home'
              ? 'bg-[#7C3BED] text-white'
              : 'text-gray-700 hover:bg-violet-100'
          }`}
          onClick={() => onNavigate('home')}
        >
          <Home className="w-4 h-4" />홈
        </button>
        <button
          className={`flex items-center gap-2 text-sm w-full px-3 py-2 rounded ${
            view === 'map'
              ? 'bg-[#7C3BED] text-white'
              : 'text-gray-700 hover:bg-violet-100'
          }`}
          onClick={() => onNavigate('map')}
        >
          <Map className="w-4 h-4" />
          지도 보기
        </button>
        <button
          className="flex items-center gap-2 text-sm text-gray-700 hover:bg-violet-100 w-full px-3 py-2 rounded"
          onClick={() => dispatch(setMemberManger(true))}
        >
          <Users className="w-4 h-4" />
          멤버 관리
        </button>
        <Listbox>
          <div className="relative">
            <ListboxButton className="flex items-center gap-2 text-sm text-gray-700 hover:bg-violet-100 w-full px-3 py-2 rounded">
              <Settings className="w-4 h-4" />
              <span>설정</span>
            </ListboxButton>

            <ListboxOptions className="absolute z-50 mt-1 w-full rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none overflow-hidden">
              <ListboxOption
                value="participation"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800 flex items-center gap-2"
                onClick={() => dispatch(setGroupParticipationModal(true))}
              >
                <LogIn className="w-4 h-4 text-violet-500" />
                그룹 참가
              </ListboxOption>
              <ListboxOption
                value="add"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800 flex items-center gap-2"
                onClick={() => dispatch(setGroupAdd(true))}
              >
                <PlusCircle className="w-4 h-4 text-violet-500" />
                그룹 추가
              </ListboxOption>
              <ListboxOption
                value="modify"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800 flex items-center gap-2"
                onClick={() => dispatch(setGroupModify(true))}
              >
                <Pencil className="w-4 h-4 text-violet-500" />
                그룹 수정
              </ListboxOption>
              <ListboxOption
                value="delete"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800 flex items-center gap-2"
                onClick={() => dispatch(setGroupDeleteModal(true))}
              >
                <Trash2 className="w-4 h-4 text-violet-500" />
                그룹 삭제
              </ListboxOption>
              <ListboxOption
                value="exit"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800 flex items-center gap-2"
                onClick={() => dispatch(setGroupExitModal(true))}
              >
                <LogOut className="w-4 h-4 text-violet-500" />
                그룹 탈퇴
              </ListboxOption>
              <ListboxOption
                value="MyPage"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800 flex items-center gap-2"
                onClick={() => dispatch(setMyPage(true))}
              >
                <User className="w-4 h-4 text-violet-500" />
                마이페이지
              </ListboxOption>
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {/* 카테고리 헤더 */}
      <div className="flex items-center justify-between text-lg font-semibold mb-2">
        <span>카테고리</span>
        <button
          className="p-1 hover:bg-gray-100 text-xs border border-[#E6E5F2] rounded-[6px] h-7 bg-[#FBFAFF] flex items-center gap-1"
          onClick={() => dispatch(setcategoryAdd(true))}
        >
          <Plus className="w-3 h-3" />
          추가
        </button>
      </div>

      {/* 카테고리 목록 */}
      <div className="flex flex-col gap-1 text-sm">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedId;
          return (
            <button
              key={cat.id}
              onClick={() => dispatch(selectCategory(cat.id))}
              className={`flex items-center justify-between px-3 py-2 rounded transition ${
                isSelected
                  ? 'bg-[#7C3BED] text-white font-medium'
                  : 'text-gray-700 hover:bg-violet-100'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs text-black rounded-2xl bg-[#F1EFFB] px-2 py-0.5">
                {cat.bookmarkCount}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
