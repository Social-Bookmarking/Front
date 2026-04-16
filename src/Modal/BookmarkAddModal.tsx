import { useState, useEffect, useRef } from 'react';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { selectSelectedGroup } from '../Util/groupSlice';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import {
  fetchCategories,
  selectCategories,
  selectSelectedId,
} from '../Util/categorySlice';
import { setBookMarkAdd } from '../Util/modalSlice';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { addBookmark } from '../Util/bookmarkSlice';
import default_image from '../assets/img/default/default_image.png';

interface OgInfo {
  title: string;
  description: string;
  image: string;
}

const BookmarkAddModal = () => {
  const [url, setUrl] = useState('');
  const [ogInfo, setOgInfo] = useState<OgInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageKey, setImageKey] = useState<string>('');

  const groupId = useAppSelector(selectSelectedGroup);
  const categories = useAppSelector(selectCategories);
  const selectedCategory = useAppSelector(selectSelectedId);
  const dispatch = useAppDispatch();

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const uploadDefaultImage = async (): Promise<string | null> => {
    try {
      const response = await fetch(default_image);
      const blob = await response.blob();
      const defaultFile = new File([blob], 'default_image.png', {
        type: blob.type || 'image/png',
      });

      const res = await axios.get(
        `https://www.marksphere.link/api/me/profile/upload-url`,
        {
          params: { fileName: defaultFile.name },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      const { presignedUrl, fileKey } = res.data;
      await axios.put(presignedUrl, defaultFile, {
        headers: { 'Content-Type': defaultFile.type },
      });

      return fileKey;
    } catch {
      toast.error('기본 이미지 업로드 중 오류가 발생했습니다.');
      return null;
    }
  };

  // 클립보드 권한 확인
  const checkClipboardPermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: 'clipboard-read' as PermissionName,
      });
      return result.state === 'granted' || result.state === 'prompt';
    } catch {
      return false;
    }
  };

  // 복사된 문자열이 url인지 확인
  function isValidUrl(text: string): boolean {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !url) {
        const hasPermission = await checkClipboardPermission();
        if (!hasPermission) {
          toast.error('권한 없음');
          return;
        }
        try {
          const text = await navigator.clipboard.readText();
          // URL 이면 parsed
          const parsed = new URL(text);
          setUrl(parsed.href);
        } catch {
          toast.error('클립보드에 URL 없음');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [url]);

  const handleFetchOgInfo = async () => {
    if (!url || !isValidUrl(url)) {
      toast.error('올바른 URL을 입력하세요!');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        'https://www.marksphere.link/api/bookmarks/og-info',
        {
          params: { url },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      const data = res.data;

      // OG 요청 성공했지만 image가 null 또는 ''일 때
      if (!data.image || data.image.trim() === '') {
        const defaultKey = await uploadDefaultImage();
        if (defaultKey) {
          setImageKey(defaultKey);
          setOgInfo({
            title: data.title ?? '',
            description: data.description ?? '',
            image: default_image,
          });
        }
      } else {
        setOgInfo({
          title: data.title.slice(0, 100) ?? '',
          description: data.description.slice(0, 5000) ?? '',
          image: data.image,
        });
        setImageKey(''); // og 이미지 직접 사용할 경우 imageKey 비움
      }

      setTitle(data.title.slice(0, 100) || '');
      setDescription(data.description.slice(0, 5000) || '');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 500) {
        const defaultKey = await uploadDefaultImage();
        if (defaultKey) {
          setImageKey(defaultKey);
          setOgInfo({
            title: '',
            description: '',
            image: default_image,
          });
        }
      } else {
        toast.error('OG 정보 추출 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!url) {
      toast.error('url이 없습니다');
      return;
    } else if (!title.trim()) {
      toast.error('제목을 작성해주세요');
      return;
    } else if (!description.trim()) {
      toast.error('설명을 작성해주세요');
      return;
    }

    try {
      const res = await axios.post(
        `https://www.marksphere.link/api/groups/${groupId}/bookmarks`,
        {
          categoryId,
          url,
          title,
          description,
          tagNames,
          // latitude: 0,
          // longitude: 0,
          imageKey,
          originalImageUrl: ogInfo?.image ?? '',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            //멱등성 보장 -> uuid 자동 생성
            'Idempotency-Key': idempotencyKeyRef.current,
          },
        },
      );

      const newBookmark = res.data;
      toast.success('저장 완료!');

      dispatch(fetchCategories(groupId));

      if (selectedCategory === res.data.categoryId || selectedCategory === -1) {
        dispatch(addBookmark(newBookmark));
      }

      dispatch(setBookMarkAdd(false));
    } catch {
      toast.error('저장 실패!');
    }
  };

  return (
    <div className="w-[50vw] max-w-md overflow-auto scrollbar-hidden">
      <h2 className="text-lg font-semibold text-violet-600 mb-4">
        📌 북마크 추가
      </h2>

      {/* URL 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL을 입력하세요"
          className="flex-1 px-3 py-2 border border-[#E6E5F2] rounded-lg"
        />
        <button
          onClick={handleFetchOgInfo}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? '불러오는 중...' : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* 미리보기 및 수정 UI */}
      {ogInfo && (
        <div className="mt-4 space-y-4 p-1 h-[400px]">
          {ogInfo.image && (
            <img
              referrerPolicy="no-referrer"
              src={ogInfo.image}
              alt={title}
              className="w-full h-40
               object-cover rounded-lg"
            />
          )}

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              제목
            </label>
            <input
              type="text"
              value={title}
              placeholder={ogInfo.title}
              onChange={(e) => {
                const MAX_TITLE_LENGTH = 100;
                const value = e.target.value;

                if (value.length > MAX_TITLE_LENGTH) {
                  toast.error(
                    `제목은 ${MAX_TITLE_LENGTH}자까지만 저장됩니다.`,
                    {
                      id: 'title-length-error',
                    },
                  );
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
              placeholder={ogInfo.description}
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
              placeholder="예: 여행, 개발, React"
              onChange={(e) => {
                const MAX_TAG_LENGTH = 15;
                const MAX_TAG_COUNT = 5;

                const rawTags = e.target.value
                  .split(',')
                  .map((name) => name.trim())
                  .filter((name) => name.length > 0);

                const processedTags = rawTags.map((tag) => {
                  if (tag.length > MAX_TAG_LENGTH) {
                    toast.error(
                      `태그는 ${MAX_TAG_LENGTH}자까지만 저장됩니다.`,
                      {
                        id: 'tag-length-error',
                      },
                    );
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
              onClick={() => dispatch(setBookMarkAdd(false))}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
              disabled={!ogInfo}
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkAddModal;
