import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Folder } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchCategories,
  selectCategories,
  selectSelectedId,
  selectCatStatus,
  selectCategory,
  createCategory,
  renameCategory,
  deleteCategory,
} from '../Util/categorySlice';

export default function CategoryManager() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const selectedId = useAppSelector(selectSelectedId);
  const status = useAppSelector(selectCatStatus);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchCategories());
  }, [dispatch, status]);

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setTempName(current);
  };
  const cancel = () => setEditingId(null);
  const commit = (id: string) => {
    const name = tempName.trim();
    if (!name) return;
    dispatch(renameCategory({ id, name }));
    setEditingId(null);
  };

  const onAdd = () => {
    dispatch(createCategory({ name: '새 카테고리' }));
  };

  const onDelete = (id: string) => {
    dispatch(deleteCategory({ id }));
  };

  return (
    <section className="rounded-xl border border-violet-100 bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2 text-gray-800 font-semibold">
          <Folder className="w-5 h-5 text-violet-500" />
          카테고리 관리
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4" />새 카테고리
        </button>
      </div>

      {/* 리스트 */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((c) => {
          const editing = editingId === c.id;
          const selected = c.id === selectedId;
          return (
            <div
              key={c.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                selected
                  ? 'border-violet-400 bg-violet-50'
                  : 'border-violet-100 bg-white'
              }`}
            >
              {/* 왼쪽: 이름 또는 입력 */}
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selected ? 'bg-violet-500' : 'bg-gray-300'
                  }`}
                />
                {editing ? (
                  <input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-sm border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-violet-300"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commit(c.id);
                      if (e.key === 'Escape') cancel();
                    }}
                  />
                ) : (
                  <button
                    onClick={() => dispatch(selectCategory(c.id))}
                    className="text-sm text-gray-800 truncate text-left"
                    title={c.name}
                  >
                    {c.name}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {editing ? (
                  <>
                    <button
                      onClick={() => commit(c.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="저장"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={cancel}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="취소"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                      {c.count}
                    </span>
                    <button
                      onClick={() => startEdit(c.id, c.name)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="이름 수정"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
