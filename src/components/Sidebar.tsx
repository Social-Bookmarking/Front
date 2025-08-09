import { FolderOpen, Users, Settings, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchCategories,
  selectCategories,
  selectSelectedId,
  selectCategory,
} from '../Util/categorySlice';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const selectedId = useAppSelector(selectSelectedId);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <aside className="w-64 h-screen p-4 border-r-2 border-[#E6E5F2] bg-[#fafafa] flex flex-col">
      {/* 워크스페이스 타이틀 */}
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
        <FolderOpen className="w-5 h-5 text-violet-500" />
        워크스페이스
      </div>

      {/* 멤버 관리 & 설정 */}
      <div className="space-y-4 ml-3 mb-8">
        <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-violet-600">
          <Users className="w-4 h-4" />
          멤버 관리
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-violet-600">
          <Settings className="w-4 h-4" />
          설정
        </button>
      </div>

      {/* 카테고리 헤더 */}
      <div className="flex items-center justify-between text-lg font-semibold mb-2">
        <span>카테고리</span>
        <button className="p-1 hover:bg-gray-100 text-xs border border-[#E6E5F2] rounded-[6px] h-7 bg-[#FBFAFF] flex items-center gap-1">
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
                  : 'text-gray-700 hover:bg-gray-100'
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
