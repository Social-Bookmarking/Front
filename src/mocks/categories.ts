import axios from 'axios';
// 나중에 uninstall 하기..
import MockAdapter from 'axios-mock-adapter';
import { v4 as uuid } from 'uuid';

let data = [
  { id: 'all', name: '전체', count: 28 },
  { id: 'design', name: '디자인', count: 12 },
  { id: 'dev', name: '개발', count: 8 },
  { id: 'mkt', name: '마케팅', count: 5 },
  { id: 'biz', name: '비즈니스', count: 3 },
];

export function setupCategoryMock() {
  const mock = new MockAdapter(axios, { delayResponse: 300 });

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
}
