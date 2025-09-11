import { Share2, Settings, Plus } from 'lucide-react';
import { useAppDispatch } from '../Util/hook';
import {
  setBookMarkAdd,
  setGroupAdd,
  setGroupModify,
  setMyPage,
  setMemberManger,
} from '../Util/modalSlice';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';

const Header = () => {
  const dispatch = useAppDispatch();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b-2 border-[#E6E5F2] bg-[#fafafa]">
      <div className="flex flex-col items-start gap-3">
        {/* 그라데이션 넣기 */}
        <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
          내 북마크 워크스페이스
        </h1>
        <div className="px-2 py-0.5 text-xs bg-[#E6E5F2] rounded-full">
          멤버 3명
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm border-2 border-[#E6E5F2] hover:bg-gray-100 rounded"
          onClick={() => dispatch(setMemberManger(true))}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden md:inline">초대</span>
        </button>
        <Listbox>
          <div className="relative">
            <ListboxButton className="flex items-center gap-1 px-3 py-1.5 text-sm border-2 border-[#E6E5F2] hover:bg-gray-100 rounded">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">설정</span>
            </ListboxButton>

            <ListboxOptions className="absolute right-0 mt-1 w-28 rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none z-50 overflow-hidden">
              <ListboxOption
                value="add"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800"
                onClick={() => dispatch(setGroupAdd(true))}
              >
                그룹 추가
              </ListboxOption>
              <ListboxOption
                value="modify"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800"
                onClick={() => dispatch(setGroupModify(true))}
              >
                그룹 수정
              </ListboxOption>
              <ListboxOption
                value="delete"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800"
              >
                그룹 삭제
              </ListboxOption>
              <ListboxOption
                value="MyPage"
                className="cursor-pointer select-none px-3 py-2 hover:bg-violet-50 text-gray-800"
                onClick={() => dispatch(setMyPage(true))}
              >
                마이페이지
              </ListboxOption>
            </ListboxOptions>
          </div>
        </Listbox>
        <button
          className="flex items-center font-medium text-white gap-1 px-3 py-1.5 text-sm bg-[#7C3BED] hover:bg-violet-700 rounded"
          onClick={() => dispatch(setBookMarkAdd(true))}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">북마크 추가</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
