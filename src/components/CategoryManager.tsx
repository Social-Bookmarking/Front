import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, Folder } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  selectCategories,
  selectSelectedId,
  selectCategory,
  renameCategory,
  deleteCategory,
  updateCategoryOrder,
  fetchCategories,
} from '../Util/categorySlice';
import { setcategoryAdd } from '../Util/modalSlice';
import { fetchBookmarks } from '../Util/bookmarkSlice';

import {
  DragOverlay,
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

/* 개별 카테고리 항목 */
const SortableItem = ({
  c,
  selected,
  editing,
  tempName,
  setTempName,
  onSelect,
  onEdit,
  onCommit,
  onCancel,
  onDelete,
}: any) => {
  const { attributes, listeners, setNodeRef } = useSortable({ id: c.id });

  // 전체(-1)은 드래그 비활성화
  if (c.id === -1) {
    return (
      <div
        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
          selected
            ? 'border-violet-400 bg-violet-50'
            : 'border-violet-100 bg-white'
        }`}
        onClick={() => onSelect(c.id)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              selected ? 'bg-violet-500' : 'bg-gray-300'
            }`}
          />
          <div className="text-sm text-gray-600 truncate">{c.name}</div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
          {c.bookmarkCount}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-grab ${
        selected
          ? 'border-violet-400 bg-violet-50'
          : 'border-violet-100 bg-white'
      }`}
      onClick={() => onSelect(c.id)}
      title={c.name}
    >
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
            className="text-sm border rounded px-2 py-1 outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommit(c.id);
              if (e.key === 'Escape') onCancel();
            }}
          />
        ) : (
          <div className="text-sm text-gray-800 truncate">{c.name}</div>
        )}
      </div>

      <div
        className="flex items-center gap-2 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
          {c.bookmarkCount}
        </span>

        {editing ? (
          <>
            <button
              onClick={() => onCommit(c.id)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Check className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(c.id, c.name)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const CategoryManager = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const selectedId = useAppSelector(selectSelectedId);
  const selectedGroupId = useAppSelector(
    (state) => state.group.selectedGroupId
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');
  const [items, setItems] = useState(categories);

  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => setItems(categories), [categories]);

  const startEdit = (id: number, current: string) => {
    setEditingId(id);
    setTempName(current);
  };
  const cancel = () => setEditingId(null);
  const commit = (id: number) => {
    const name = tempName.trim();
    if (!name) return;
    dispatch(renameCategory({ id, name }));
    dispatch(
      fetchBookmarks({
        groupId: selectedGroupId,
        categoryId: selectedId,
        cursor: null,
      })
    );
    setEditingId(null);
  };
  const onAdd = () => dispatch(setcategoryAdd(true));
  const onDelete = (id: number) => {
    dispatch(deleteCategory({ id }));
    dispatch(
      fetchBookmarks({ groupId: selectedGroupId, categoryId: -1, cursor: null })
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const hanldeDragStart = async (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const ordered = reordered
      .filter((c) => c.id !== -1) // 전체 제외
      .map((c, index) => ({
        categoryId: c.id,
        position: index,
      }));

    if (selectedGroupId === null) return;
    await dispatch(updateCategoryOrder({ groupId: selectedGroupId, ordered }));
    await dispatch(fetchCategories(selectedGroupId));
  };

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={hanldeDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((c) => (
              <SortableItem
                key={c.id}
                c={c}
                selected={c.id === selectedId}
                editing={editingId === c.id}
                tempName={tempName}
                setTempName={setTempName}
                onSelect={(id: number) => dispatch(selectCategory(id))}
                onEdit={startEdit}
                onCommit={commit}
                onCancel={cancel}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-white shadow-lg">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <div className="text-sm text-gray-800 truncate">
                  {activeItem.name}
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                {activeItem.bookmarkCount}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
};

export default CategoryManager;
