"use strict"

import RepoState from 'RepoState'

describe('RepoState.add', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    RepoState.__clear();
  });

  describe('Initial state setup', () => {
    test('should initialize state when called on empty RepoState', () => {
      const initialState = { user: { name: 'John' } };

      RepoState.add(initialState);

      expect(RepoState.getSnapshot()).toEqual(initialState);
    });

    test('should work as initState replacement', () => {
      const state = { app: { theme: 'dark' } };

      RepoState.add(state);

      expect(RepoState.getSnapshot()).toEqual(state);
    });
  });

  describe('Deep merge behavior', () => {
    test('should deep merge non-conflicting state', () => {
      RepoState.add({ user: { name: 'John' } });
      RepoState.add({ user: { age: 30 }, settings: { theme: 'dark' } });

      expect(RepoState.getSnapshot()).toEqual({
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark' }
      });
    });

    test('should throw error on conflicting properties', () => {
      RepoState.add({ user: { name: 'John' } });

      expect(() => {
        RepoState.add({ user: { name: 'Jane' } });
      }).toThrowError('State conflict detected at path: user.name');
    });

    test('should handle nested object merging', () => {
      RepoState.add({
        app: {
          ui: { theme: 'dark' },
          api: { timeout: 5000 }
        }
      });

      RepoState.add({
        app: {
          ui: { fontSize: 14 },
          cache: { enabled: true }
        }
      });

      expect(RepoState.getSnapshot()).toEqual({
        app: {
          ui: { theme: 'dark', fontSize: 14 },
          api: { timeout: 5000 },
          cache: { enabled: true }
        }
      });
    });

    test('should throw error on array conflicts', () => {
      RepoState.add({ items: [1, 2, 3] });

      expect(() => {
        RepoState.add({ items: [4, 5, 6] });
      }).toThrowError('State conflict detected at path: items');
    });

    test('should throw error on primitive conflicts', () => {
      RepoState.add({ count: 1 });

      expect(() => {
        RepoState.add({ count: 2 });
      }).toThrowError('State conflict detected at path: count');
    });
  });

  describe('Reducers integration', () => {
    test('should add reducers with array format', () => {
      const userReducer = jest.fn((state, value) => ({ ...state, ...value }));
      const settingsReducer = jest.fn((state) => state === 'dark' ? 'light' : 'dark');

      RepoState.add(
        {
          user: { name: 'John' },
          settings: { theme: 'dark' }
        },
        [
          { path: 'user', type: 'update', reducer: userReducer },
          { path: 'settings.theme', type: 'toggle', reducer: settingsReducer }
        ]
      );

      const reducers = RepoState.getReducers();
      expect(reducers['user']['update']).toBe(userReducer);
      expect(reducers['settings.theme']['toggle']).toBe(settingsReducer);
    });

    test('should work without reducers', () => {
      RepoState.add({ user: { name: 'John' } });

      expect(RepoState.getSnapshot()).toEqual({
        user: { name: 'John' }
      });
    });
  });

  describe('Error handling', () => {
    test('should throw error for invalid state', () => {
      expect(() => RepoState.add(null)).toThrowError('State to add must be a valid object');
      expect(() => RepoState.add('string')).toThrowError('State to add must be a valid object');
      expect(() => RepoState.add(123)).toThrowError('State to add must be a valid object');
    });
  });

  describe('State immutability', () => {
    test('should not mutate original state objects', () => {
      const originalState = { user: { name: 'John' } };
      const stateToAdd = { user: { age: 30 } };

      RepoState.add(originalState);
      RepoState.add(stateToAdd);

      // Original objects should not be modified
      expect(originalState).toEqual({ user: { name: 'John' } });
      expect(stateToAdd).toEqual({ user: { age: 30 } });
    });
  });

});
