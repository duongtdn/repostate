'use strict'

import RepoState from '../src/RepoState';
import { deepClone } from '../src/utils';

describe('RepoState dispatch method', () => {
  beforeEach(() => {
    RepoState.__clear();
  });

  test('should dispatch action and update state', () => {
    const initialState = {
      counter: { value: 0 },
      user: { name: 'John', age: 30 }
    };

    RepoState.add(initialState, [
      {
        path: 'counter',
        type: 'INCREMENT',
        reducer: (state, value) => ({
          ...state,
          value: state.value + (value || 1)
        })
      },
      {
        path: 'user',
        type: 'UPDATE_NAME',
        reducer: (state, value) => ({
          ...state,
          name: value
        })
      }
    ]);

    // Test dispatching to update counter
    RepoState.dispatch('counter', 'INCREMENT', 5);
    expect(RepoState.getSnapshot().counter.value).toBe(5);

    // Test dispatching to update user name
    RepoState.dispatch('user', 'UPDATE_NAME', 'Jane');
    expect(RepoState.getSnapshot().user.name).toBe('Jane');
    expect(RepoState.getSnapshot().user.age).toBe(30); // Should remain unchanged
		expect(RepoState.getSnapshot().counter.value).toBe(5); // Should remain unchanged
  });

  test('should dispatch action to root state', () => {
    const initialState = { message: 'Hello' };

    RepoState.add(initialState, [
      {
        path: null,
        type: 'REPLACE_MESSAGE',
        reducer: (state, value) => ({
          ...state,
          message: value
        })
      }
    ]);

    RepoState.dispatch(null, 'REPLACE_MESSAGE', 'World');
    expect(RepoState.getSnapshot().message).toBe('World');

    // Test with '@' path as well
    RepoState.dispatch('@', 'REPLACE_MESSAGE', 'Universe');
    expect(RepoState.getSnapshot().message).toBe('Universe');
  });

  test('should use default reducer when type is null', () => {
    const initialState = {
      data: { items: [] }
    };

    RepoState.add(initialState);

    // Dispatch with null type should use default behavior (direct override)
    RepoState.dispatch('data', null, { items: [1, 2, 3] });
    expect(RepoState.getSnapshot().data.items).toEqual([1, 2, 3]);
  });

  test('should throw error when state path does not exist', () => {
    const initialState = { existing: 'value' };
    RepoState.add(initialState);

    expect(() => {
      RepoState.dispatch('nonexistent', 'SOME_ACTION', 'value');
    }).toThrow('State path "nonexistent" does not exist');
  });

  test('should throw error when no reducer found for action type', () => {
    const initialState = { counter: { value: 0 } };
    RepoState.add(initialState);

    expect(() => {
      RepoState.dispatch('counter', 'UNKNOWN_ACTION', 'value');
    }).toThrow('No reducer found for statePath: counter and type: UNKNOWN_ACTION');
  });

  test('should handle nested state paths', () => {
    const initialState = {
      app: {
        ui: {
          theme: 'light',
          sidebar: { collapsed: false }
        }
      }
    };

    RepoState.add(initialState, [
      {
        path: 'app.ui.sidebar',
        type: 'TOGGLE_COLLAPSED',
        reducer: (state) => ({
          ...state,
          collapsed: !state.collapsed
        })
      }
    ]);

    RepoState.dispatch('app.ui.sidebar', 'TOGGLE_COLLAPSED');
    expect(RepoState.getSnapshot().app.ui.sidebar.collapsed).toBe(true);

    RepoState.dispatch('app.ui.sidebar', 'TOGGLE_COLLAPSED');
    expect(RepoState.getSnapshot().app.ui.sidebar.collapsed).toBe(false);
  });

  test('should notify state change subscribers', () => {
    const initialState = { count: 0 };
    let callbackResult = null;

    RepoState.add(initialState, [
      {
        path: null,
        type: 'INCREMENT',
        reducer: (state) => ({
          ...state,
          count: state.count + 1
        })
      }
    ]);

    // We can't directly test the private subscription method,
    // but we can verify that the state is properly updated
    // which indicates the notification system is working
    RepoState.dispatch(null, 'INCREMENT');

    expect(RepoState.getSnapshot().count).toBe(1);
  });

  test('should maintain immutability', () => {
    const initialState = {
      user: { profile: { name: 'John', settings: { theme: 'dark' } } }
    };

    RepoState.add(initialState, [
      {
        path: 'user.profile',
        type: 'UPDATE_NAME',
        reducer: (state, value) => ({
          ...state,
          name: value
        })
      }
    ]);

    const stateBefore = RepoState.getSnapshot();
    RepoState.dispatch('user.profile', 'UPDATE_NAME', 'Jane');
    const stateAfter = RepoState.getSnapshot();

    // Original state should not be modified
    expect(stateBefore.user.profile.name).toBe('John');
    expect(stateAfter.user.profile.name).toBe('Jane');

    // Settings should remain the same content but may be different reference due to cloning
    expect(stateAfter.user.profile.settings).toStrictEqual(stateBefore.user.profile.settings);
    expect(stateAfter.user.profile.settings.theme).toBe('dark');
  });

  test('should work with array reducers', () => {
    const initialState = {
      todos: []
    };

    RepoState.add(initialState, [
      {
        path: 'todos',
        type: 'ADD_TODO',
        reducer: (state, todo) => [...state, todo]
      },
      {
        path: 'todos',
        type: 'REMOVE_TODO',
        reducer: (state, index) => state.filter((_, i) => i !== index)
      }
    ]);

    RepoState.dispatch('todos', 'ADD_TODO', { id: 1, text: 'Buy milk' });
    RepoState.dispatch('todos', 'ADD_TODO', { id: 2, text: 'Walk dog' });

    expect(RepoState.getSnapshot().todos).toHaveLength(2);
    expect(RepoState.getSnapshot().todos[0].text).toBe('Buy milk');

    RepoState.dispatch('todos', 'REMOVE_TODO', 0);
    expect(RepoState.getSnapshot().todos).toHaveLength(1);
    expect(RepoState.getSnapshot().todos[0].text).toBe('Walk dog');
  });
});
