import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStore } from './store.js';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

describe('createStore', () => {
  let testFilePath;
  let store;

  beforeEach(() => {
    testFilePath = path.join(os.tmpdir(), `test-store-${Date.now()}.json`);
    store = createStore(testFilePath);
  });

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('returns an empty array when no file exists', () => {
    expect(store.load()).toEqual([]);
  });

  it('can save and reload items', () => {
    const items = [{ id: 1, text: 'Test item' }];
    store.save(items);
    
    const loaded = store.load();
    expect(loaded).toEqual(items);
  });

  it('overwrites correctly when saving twice', () => {
    const firstItems = [{ id: 1, text: 'First item' }];
    store.save(firstItems);
    
    const secondItems = [{ id: 2, text: 'Second item' }];
    store.save(secondItems);
    
    const loaded = store.load();
    expect(loaded).toEqual(secondItems);
  });
});
