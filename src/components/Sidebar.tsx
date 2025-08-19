import {
  FolderOpen,
  Users,
  Settings,
  Plus,
  Home,
  Map,
  ChevronDown,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchCategories,
  selectCategories,
  selectSelectedId,
  selectCategory,
} from '../Util/categorySlice';
import { setcategoryAdd, setMemberManger } from '../Util/modalSlice';
import {
  selectGroups,
  selectSelectedGroup,
  changeGroup,
} from '../Util/groupSlice';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';

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
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <aside className="w-64 h-screen p-4 border-r-2 border-[#E6E5F2] bg-[#fafafa] flex flex-col">
      {/* 북마크스페이스 타이틀 */}
      <div className="mb-6">
        <Listbox
          value={selectedGroupId ?? undefined}
          onChange={(id) => dispatch(changeGroup(id))}
        >
          <div className="relative">
            <ListboxButton className="flex items-center justify-between w-full px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-violet-300">
              <span className="flex items-center gap-2 font-semibold text-gray-800">
                <FolderOpen className="w-5 h-5 text-violet-500" />
                {selectedGroup?.name ?? '북마크 스페이스'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </ListboxButton>

            <ListboxOptions className="absolute z-50 mt-1 w-full rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none overflow-hidden">
              {groups.map((g) => (
                <ListboxOption
                  key={g.id}
                  value={g.id}
                  className="cursor-pointer select-none px-3 py-2 data-[focus]:bg-violet-50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{g.name}</span>
                    {g.description && (
                      <span className="text-xs text-gray-500">
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
        <button className="flex items-center gap-2 text-sm text-gray-700 hover:bg-violet-100 w-full px-3 py-2 rounded">
          <Settings className="w-4 h-4" />
          설정
        </button>
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
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
