// useRepoState.hook.test.js

import { renderHook, act } from '@testing-library/react';
import useRepoState from 'useRepoState.hook';
import RepoContext from 'RepoContext';
import React from 'react';

const mockState = {
  root: {
    trunk: {
      branch: 'leaf',
      anotherBranch: ['leaf', 'left'],
    },
    leaves: [
      { id: 1, name: 'Leaf 1' },
      { id: 2, name: 'Leaf 2' },
    ],
  },
  secondaryRoot: {
    flowers: [
      { id: 1, type: 'rose' },
      { id: 2, type: 'tulip' }
    ]
  }
};

const mockDispatch = jest.fn();

const wrapper = ({ children }) => (
  <RepoContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
    {children}
  </RepoContext.Provider>
);

describe('useRepoState', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return entire state when statePaths is null', () => {
    const { result } = renderHook(() => useRepoState(null), { wrapper });

    expect(result.current[0]).toEqual(mockState);
  });

  test('should return entire state when statePaths is "@"', () => {
    const { result } = renderHook(() => useRepoState('@'), { wrapper });

    expect(result.current[0]).toEqual(mockState);
  });

  test('should return substate when statePaths is a single string', () => {
    const { result } = renderHook(() => useRepoState('root.trunk'), { wrapper });

    expect(result.current[0]).toEqual({
      branch: 'leaf',
      anotherBranch: ['leaf', 'left'],
    });
  });

  test('should return substates when statePaths is an array of strings', () => {
    const { result } = renderHook(() => useRepoState(['root.trunk.branch', 'root.leaves']), { wrapper });

    expect(result.current[0]).toEqual({
      root: {
        trunk: {
          branch: 'leaf'
        },
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ],
      }
    });
  });

  test('should return substate for a deeply nested statePath', () => {
    const { result } = renderHook(() => useRepoState('secondaryRoot.flowers'), { wrapper });

    expect(result.current[0]).toEqual([
      { id: 1, type: 'rose' },
      { id: 2, type: 'tulip' }
    ]);
  });

  test('should call dispatch with the correct action object', () => {
    const { result } = renderHook(() => useRepoState('root.trunk'), { wrapper });

    act(() => {
      result.current[1]('root.trunk.branch', 'set', 'newLeaf');
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      statePath: 'root.trunk.branch',
      type: 'set',
      value: 'newLeaf'
    });
  });

});
