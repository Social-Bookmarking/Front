import { Map } from 'react-kakao-maps-sdk';

const BookmarkMap = () => {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">북마크 지도</h1>
        <p className="mt-2">저장된 북마크를 지도에서 확인하세요</p>
      </div>
      <div className="h-[calc(100vh-250px)] rounded-lg border bg-card">
        <Map
          center={{ lat: 33.450701, lng: 126.570667 }}
          style={{ width: '100%', height: '100%' }}
          level={3}
        />
      </div>
    </div>
  );
};

export default BookmarkMap;
