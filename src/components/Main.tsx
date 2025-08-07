import BookmarkCard from './BookmarkCard';
import default_img from '../assets/img/default/default.jpg';

const Main = () => {
  const bookmarks = [
    {
      title: '현대적인 워크스페이스 디자인 가이드',
      description: '효율적이고 창의적인 업무 환경을 위한 디자인 원칙과 실전',
      imageUrl: default_img,
      tag: '디자인',
    },
    {
      title: '디자인 서적 추천 리스트',
      description: '디자이너라면 꼭 읽어야 할 필수 도서들을 엄선했습니다.',
      imageUrl: default_img,
      tag: '디자인',
    },
    {
      title: '모바일 앱 UI/UX 트렌드 2024',
      description:
        '올해 주목해야 할 모바일 앱 디자인 트렌드와 사용자 경험 패턴.',
      imageUrl: default_img,
      tag: '개발',
    },
  ];

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      {/* 검색 바 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="⌕ 북마크 검색..."
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* 북마크 카드 목록 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {bookmarks.map((bookmark, idx) => (
          <BookmarkCard key={idx} {...bookmark} />
        ))}
      </div>
    </main>
  );
};

export default Main;
