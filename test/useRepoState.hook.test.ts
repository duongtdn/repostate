// useRepoState.hook.test.ts

import { renderHook, act } from '@testing-library/react';
import useRepoState from '../src/useRepoState.hook';
import RepoContext from '../src/RepoContext';
import React from 'react';
import type { ReactNode } from 'react';

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

const wrapper = ({ children }: { children: ReactNode }) => {
  return React.createElement(
    RepoContext.Provider,
    { value: { state: mockState, dispatch: mockDispatch } },
    children
  );
};

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

  test('should return substate for a deeply nested statePath to an object', () => {
    const { result } = renderHook(() => useRepoState('root.trunk'), { wrapper });

    expect(result.current[0]).toEqual({
      branch: 'leaf',
      anotherBranch: ['leaf', 'left'],
    });
  });

  test('should return substate for a deeply nested statePath to an array', () => {
    const { result } = renderHook(() => useRepoState('secondaryRoot.flowers'), { wrapper });

    expect(result.current[0]).toEqual([
      { id: 1, type: 'rose' },
      { id: 2, type: 'tulip' }
    ]);
  });

  test('should return substate for a deeply nested statePath to a scalar value', () => {
    const { result } = renderHook(() => useRepoState('root.trunk.branch'), { wrapper });

    expect(result.current[0]).toEqual('leaf');
  });

  test('should call dispatch with the correct action object', () => {
    const { result } = renderHook(() => useRepoState('root.trunk'), { wrapper });

    act(() => {
      result.current[1]('set', 'newLeaf');
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      statePath: 'root.trunk',
      type: 'set',
      value: 'newLeaf'
    });
  });

});