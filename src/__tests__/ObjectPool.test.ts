import { describe, it, expect } from 'vitest';
import { ObjectPool } from '../systems/ObjectPool';

interface TestItem {
  value: number;
  active: boolean;
}

describe('ObjectPool', () => {
  it('creates new items when pool is empty', () => {
    const pool = new ObjectPool<TestItem>(
      () => ({ value: 0, active: true }),
      (item) => { item.active = false; }
    );
    const item = pool.acquire();
    expect(item).toBeDefined();
    expect(item.active).toBe(true);
  });

  it('reuses released items', () => {
    const pool = new ObjectPool<TestItem>(
      () => ({ value: 0, active: true }),
      (item) => { item.active = false; }
    );
    const item1 = pool.acquire();
    item1.value = 42;
    pool.release(item1);

    const item2 = pool.acquire();
    expect(item2).toBe(item1);
    expect(item2.active).toBe(false);
  });

  it('pre-initializes items', () => {
    let count = 0;
    const pool = new ObjectPool<TestItem>(
      () => { count++; return { value: count, active: true }; },
      (item) => { item.active = false; },
      5
    );
    expect(count).toBe(5);
  });
});
