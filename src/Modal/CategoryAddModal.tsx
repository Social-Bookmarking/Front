import { useAppDispatch } from '../Util/hook';
import { createCategory } from '../Util/categorySlice';
import { setcategoryAdd } from '../Util/modalSlice';
import { useState } from 'react';

const CategoryAddModal = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const dispatch = useAppDispatch();

  const onAdd = (text: string) => {
    if (text.length > 0) {
      dispatch(createCategory({ name: text }));
      dispatch(setcategoryAdd(false));
    }
  };

  return (
    <div className="space-y-4 w-[50vw]">
      <h1 className="text-xl text- font-bold">새 카테고리 추가</h1>
      <div>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAdd(newCategoryName);
          }}
          placeholder="카테고리 이름"
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
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
            onAdd(newCategoryName);
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
};

export default CategoryAddModal;
