"use strict"
import { useContext } from 'react';
import useRepoState from 'useRepoState.hook';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

describe('useRepoState Hook', () => {

  const mockState = { root: { branch: 'leaf' } };
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return state and dispatch from RepoContext', () => {
    useContext.mockReturnValue({
      state: mockState,
      dispatch: mockDispatch,
    });

    const result = useRepoState();

    expect(result[0]).toEqual(mockState);
    expect(result[1]).toEqual(mockDispatch);
  });

  test('should throw error if RepoContext is not set properly', () => {
    useContext.mockReturnValue(undefined);
    expect(() => useRepoState()).toThrowError();
  });

});
