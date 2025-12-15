import { useAppSelector, useAppDispatch } from '../Util/hook';
import { createCategory } from '../Util/categorySlice';
import { selectSelectedGroup } from '../Util/groupSlice';
import { setcategoryAdd } from '../Util/modalSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';

const CategoryAddModal = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const selectedGroupId = useAppSelector(selectSelectedGroup);
  const dispatch = useAppDispatch();

  const onAdd = (groupId: number | null, text: string) => {
    if (text.length > 0 && groupId !== null) {
      dispatch(createCategory({ groupId: groupId, name: text }));
      dispatch(setcategoryAdd(false));
    }
  };

  return (
    <div className="space-y-4 w-[50vw] max-w-md">
      <h1 className="text-xl text- font-bold">새 카테고리 추가</h1>
      <div>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => {
            const MAX_CATEGORY_LENGTH = 20;
            const value = e.target.value;

            if (value.length > MAX_CATEGORY_LENGTH) {
              toast.error(`제목은 ${MAX_CATEGORY_LENGTH}자까지만 저장됩니다.`, {
                id: 'title-length-error',
              });
              setNewCategoryName(value.slice(0, MAX_CATEGORY_LENGTH));
              return;
            }
            setNewCategoryName(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAdd(selectedGroupId, newCategoryName);
          }}
          placeholder="카테고리 이름"
          className="w-full px-4 py-2 border border-[#E6E5F2] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm border-2 border-[#E6E5F2] hover:bg-gray-100 rounded"
          onClick={() => dispatch(setcategoryAdd(false))}
        >
          취소
        </button>
        <button
          className="flex text-white items-center gap-1 px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-400 rounded"
          onClick={() => {
            onAdd(selectedGroupId, newCategoryName);
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
};

export default CategoryAddModal;
