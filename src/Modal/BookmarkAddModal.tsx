import { useState } from 'react';
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

  const handleFetchOgInfo = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await axios.get(
        'http://www.marksphere.link:8080/api/bookmarks/og-info',
        {
          params: { url },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log(res);
      setOgInfo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[40vw]">
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
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={handleFetchOgInfo}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
          disabled={loading}
        >
          {loading ? '불러오는 중...' : '불러오기'}
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
