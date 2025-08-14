import axios from 'axios';
// 나중에 uninstall 하기..
import MockAdapter from 'axios-mock-adapter';
import { v4 as uuid } from 'uuid';

export function setupMocks() {
  const mock = new MockAdapter(axios, { delayResponse: 300 });

  // 카테고리 mock
  let data = [
    { id: 'all', name: '전체', count: 28 },
    { id: 'design', name: '디자인', count: 12 },
    { id: 'dev', name: '개발', count: 8 },
    { id: 'mkt', name: '마케팅', count: 5 },
    { id: 'biz', name: '비즈니스', count: 3 },
  ];

  mock.onGet('/api/categories').reply(200, data);

  mock.onPost('/api/categories').reply((config) => {
    const { name } = JSON.parse(config.data);
    const item = { id: uuid(), name, count: 0 };
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
    const id = config.url!.split('/').pop()!;
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

  return mock;
}
