import { Check, ChevronDown } from 'lucide-react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import { fetchCategories, selectCategories } from '../Util/categorySlice';
import { useEffect, useState } from 'react';
import { updateBookmark } from '../Util/bookmarkSlice';
import { setBookMarkModifyModal } from '../Util/modalSlice';
import axios from 'axios';
import default_image from '../assets/img/default/default_image.png';

const BookmarkModifyModal = () => {
  //마우스 로딩
  const setGlobalCursor = (type: 'wait' | 'default') => {
    document.body.style.cursor = type;
  };

  const dispatch = useAppDispatch();
  const bookmarkId = useAppSelector(
    (state) => state.modal.bookmarkModifybookmarkId,
  );

  const categories = useAppSelector(selectCategories);
  const bookmark = useAppSelector((state) =>
    state.bookmark.items.find((b) => b.bookmarkId === bookmarkId),
  );
  const selectedGroupId = useAppSelector(
    (state) => state.group.selectedGroupId,
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // 이미지
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setDescription(bookmark.description);
      setTagNames(bookmark.tags.map((t) => t.tagName));
      setTagInput(bookmark.tags.map((t) => t.tagName).join(', '));
      setCategoryId(bookmark.categoryId);
      setPreviewUrl(bookmark.imageUrl || null);
    }
  }, [bookmark]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleResetImage = async () => {
    const response = await fetch(default_image);
    const blob = await response.blob();

    const defaultFile = new File([blob], 'default_image.png', {
      type: blob.type || 'image/png',
    });

    setImageFile(defaultFile);
    setPreviewUrl(default_image);
  };

  const handleSave = async () => {
    if (!bookmarkId || !bookmark) return;

    const updates: {
      bookmarkId: number;
      title?: string;
      description?: string;
      categoryId?: number;
      tagNames?: string[];
      imageKey?: string;
      previewUrl?: string;
    } = { bookmarkId };

    if (title.trim() === '') {
      toast.error('제목을 입력해주세요');
    } else if (description.trim() === '') {
      toast.error('설명을 입력해주세요');
    }

    if (title !== bookmark.title) updates.title = title;
    if (description !== bookmark.description) updates.description = description;
    if (categoryId !== bookmark.categoryId) updates.categoryId = categoryId!;
    if (
      JSON.stringify(tagNames) !==
      JSON.stringify(bookmark.tags.map((t) => t.tagName))
    ) {
      updates.tagNames = tagNames;
    }

    try {
      setUploading(true);
      setGlobalCursor('wait');
      if (imageFile) {
        const res = await axios.get(
          `https://www.marksphere.link/api/me/profile/upload-url`,
          {
            params: { fileName: imageFile.name },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );

        const { presignedUrl, fileKey } = res.data;

        await axios.put(presignedUrl, imageFile, {
          headers: { 'Content-Type': imageFile.type },
        });

        updates.imageKey = fileKey;
        updates.previewUrl = previewUrl || '';
      }

      await dispatch(updateBookmark(updates)).unwrap();

      if (updates.categoryId && updates.categoryId !== bookmark.categoryId) {
        if (selectedGroupId) {
          await dispatch(fetchCategories(selectedGroupId));
        }
      }

      toast.success('북마크가 수정되었습니다');
      dispatch(setBookMarkModifyModal({ open: false }));
    } catch {
      toast.error('북마크 수정에 실패했습니다');
    } finally {
      setUploading(false);
      setGlobalCursor('default');
    }
  };

  if (!bookmark) return null;

  return (
    <div className="w-[50vw] max-w-md overflow-auto scrollbar-hidden">
      <h2 className="text-lg font-semibold text-violet-600 mb-4">
        📌 북마크 수정
      </h2>
      <div className="mt-4 space-y-4 p-1 h-[400px]">
        {/* 이미지 업로드 */}
        <div className="flex flex-col items-center border-2 border-[#E6E5F2] rounded-lg p-3 space-y-3">
          <label className="cursor-pointer flex flex-col items-center space-y-3">
            {previewUrl ? (
              <img
                referrerPolicy="no-referrer"
                src={previewUrl}
                alt="미리보기"
                className="w-full h-40 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                기본 이미지
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">
              이미지를 클릭하여 변경하세요
            </p>
          </label>

          {previewUrl && (
            <button
              onClick={handleResetImage}
              className="text-xs text-red-500 hover:underline"
            >
              기본 이미지
            </button>
          )}

          {uploading && <p className="text-xs text-gray-400">업로드 중...</p>}
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const MAX_TITLE_LENGTH = 100;
              const value = e.target.value;

              if (value.length > MAX_TITLE_LENGTH) {
                toast.error(`제목은 ${MAX_TITLE_LENGTH}자까지만 저장됩니다.`, {
                  id: 'title-length-error',
                });
                setTitle(value.slice(0, MAX_TITLE_LENGTH));
                return;
              }

              setTitle(value);
            }}
            className="w-full px-3 py-2 border border-[#E6E5F2] rounded-lg"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              const MAX_DESCRIPTION_LENGTH = 5000;
              const value = e.target.value;

              if (value.length > MAX_DESCRIPTION_LENGTH) {
                toast.error(
                  `설명은 ${MAX_DESCRIPTION_LENGTH}자까지만 저장됩니다.`,
                  {
                    id: 'description-length-error',
                  },
                );
                setDescription(value.slice(0, MAX_DESCRIPTION_LENGTH));
                return;
              }

              setDescription(value);
            }}
            className="w-full h-30 px-3 py-2 border border-[#E6E5F2] rounded-lg"
          />
        </div>

        {/* 카테고리 선택 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <Listbox value={categoryId} onChange={setCategoryId}>
            <ListboxButton className="w-full flex justify-between items-center h-10 rounded-lg border border-violet-300 bg-white px-3 text-left focus:outline-none focus:ring-2 focus:ring-violet-300">
              <span className="truncate">
                {categories.find((c) => c.id === categoryId)?.name ||
                  '카테고리 선택'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </ListboxButton>

            <ListboxOptions className="absolute z-50 w-full mt-1 rounded-lg border border-violet-100 bg-white shadow-lg focus:outline-none max-h-30 overflow-auto">
              {categories
                .filter((cat) => cat.id !== -1)
                .map((cat) => (
                  <ListboxOption
                    key={cat.id}
                    value={cat.id}
                    className="cursor-pointer select-none px-3 py-2 data-[focus]:bg-violet-50 flex justify-between"
                  >
                    {({ selected }) => (
                      <>
                        <span>{cat.name}</span>
                        {selected && (
                          <Check className="w-4 h-4 text-violet-600" />
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
            </ListboxOptions>
          </Listbox>
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => {
              const inputValue = e.target.value;
              setTagInput(inputValue);

              const MAX_TAG_LENGTH = 15;
              const MAX_TAG_COUNT = 5;

              const rawTags = inputValue
                .split(',')
                .map((name) => name.trim())
                .filter((name) => name.length > 0);

              const processedTags = rawTags.map((tag) => {
                if (tag.length > MAX_TAG_LENGTH) {
                  toast.error(`태그는 ${MAX_TAG_LENGTH}자까지만 저장됩니다.`, {
                    id: 'tag-length-error',
                  });
                  return tag.slice(0, MAX_TAG_LENGTH);
                }
                return tag;
              });

              if (processedTags.length > MAX_TAG_COUNT) {
                toast.error(
                  `태그는 최대 ${MAX_TAG_COUNT}개까지만 등록됩니다.`,
                  {
                    id: 'tag-count-error',
                  },
                );
              }

              setTagNames(processedTags.slice(0, MAX_TAG_COUNT));
            }}
            className="w-full px-3 py-2 border border-[#E6E5F2] rounded-lg"
          />
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => dispatch(setBookMarkModifyModal({ open: false }))}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkModifyModal;
