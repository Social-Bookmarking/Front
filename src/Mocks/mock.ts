import axios from 'axios';
// 나중에 uninstall 하기..
import MockAdapter from 'axios-mock-adapter';

export function setupMocks() {
  const mock = new MockAdapter(axios, { delayResponse: 300 });

  // 인증 관련 API는 실제 서버로 흘려보내기
  mock.onAny(/\/api\/auth\//).passThrough();

  // 카테고리 mock
  let data = [
    { id: 1, name: '전체', count: 28 },
    { id: 2, name: '디자인', count: 12 },
    { id: 3, name: '개발', count: 8 },
    { id: 4, name: '마케팅', count: 5 },
    { id: 5, name: '비즈니스', count: 3 },
  ];

  mock.onGet('/api/categories').reply(200, data);

  let nextId = 6;
  mock.onPost('/api/categories').reply((config) => {
    const { name } = JSON.parse(config.data);
    const item = { id: nextId++, name, count: 0 };
    data = [...data, item];
    return [200, item];
  });

  mock.onPut(/\/api\/categories\/.+/).reply((config) => {
    const { id, name } = JSON.parse(config.data);
    data = data.map((c) => (c.id === id ? { ...c, name } : c));
    const updated = data.find((c) => c.id === id)!;
    return [200, updated];
  });

  mock.onDelete(/\/api\/categories\/.+/).reply((config) => {
    const id = Number(config.url!.split('/').pop());
    data = data.filter((c) => c.id !== id);
    return [200];
  });

  //  멤버 mock
  let members = [
    {
      id: '1',
      name: '홍길동',
      email: 'Hong@example.com',
      profile: '',
      role: '관리자',
    },
    {
      id: '2',
      name: '김철수',
      email: 'Kim@example.com',
      profile: '',
      role: '뷰어',
    },
    {
      id: '3',
      name: '이영희',
      email: 'Lee@example.com',
      profile: '',
      role: '편집자',
    },
  ];

  mock.onGet('/api/members').reply(200, members);

  mock.onPost('/api/members').reply((config) => {
    const { id, name, email, profile, role } = JSON.parse(config.data);
    members.push({ id, name, email, profile, role });
    return [200, { id, name, email, profile, role }];
  });

  mock.onDelete(/\/api\/members\/\w+/).reply((config) => {
    const id = config.url!.split('/').pop();
    members = members.filter((m) => m.id !== id);
    return [200];
  });

  // 북마크 mock
  const allBookmarks = Array.from({ length: 40 }).map((_, i) => ({
    categoryId: (i % 5) + 1,
    url: `https://example.com/${i + 1}`,
    title: `북마크 ${i + 1}`,
    description: `${i + 1}번째 북마크 설명`,
    imageUrl: `https://picsum.photos/seed/${i + 1}/400/240`,
    tagIds: [i % 3, (i + 1) % 3],
    latitude: 37.5 + Math.random() * 0.1,
    longitude: 127.0 + Math.random() * 0.1,
    isFavorite: Math.random() < 0.3, //30% 확률로 true
  }));

  mock.onGet('/api/bookmarks').reply((config) => {
    const page = parseInt(config.params?.page || '1', 10);
    const pageSize = 10; // 한 번에 10개씩
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = allBookmarks.slice(start, end);
    return [200, slice];
  });

  return mock;
}
