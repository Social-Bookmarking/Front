import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';

interface OgInfo {
  title: string;
  description: string;
  image: string;
}

const BookmarkAddModal = () => {
  const [url, setUrl] = useState('');
  const [ogInfo, setOgInfo] = useState<OgInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // 클립보드 권한 확인
  const checkClipboardPermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: 'clipboard-read' as PermissionName,
      });
      return result.state === 'granted' || result.state === 'prompt';
    } catch (err) {
      console.log('권한 API 지원 안함', err);
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
          console.log('권한 없음');
          return;
        }
        try {
          const text = await navigator.clipboard.readText();
          // URL 이면 parsed
          const parsed = new URL(text);
          setUrl(parsed.href);
        } catch {
          console.log('클립보드에 URL 없음');
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
      alert('올바른 URL을 입력하세요!');
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
        }
      );
      setOgInfo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[50vw] max-w-md">
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
          className="flex-1 px-3 py-2 border border-[#E6E5F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={handleFetchOgInfo}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
          disabled={loading}
        >
          {loading ? '불러오는 중...' : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* 미리보기 */}
      {ogInfo && (
        <div className="mt-4 border-b-2 border-[#E6E5F2] rounded-lg shadow-sm overflow-hidden">
          {ogInfo.image && (
            <img
              src={ogInfo.image}
              alt={ogInfo.title}
              className="w-full h-40 object-cover"
            />
          )}
          <div className="p-3">
            <h3 className="font-bold text-[20px] mb-3 line-clamp-2">
              {ogInfo.title}
            </h3>
            <p className="text-xs text-gray-600">{ogInfo.description}</p>
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="mt-6 flex justify-end gap-2">
        <button
          // onClick={onClose}
          className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          // onClick={handleSave}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
          disabled={!ogInfo}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default BookmarkAddModal;
