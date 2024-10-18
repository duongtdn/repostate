"use strict"

import RepoState from 'RepoState'

describe('initState Function', () => {

  const mockState = { root: { branch: 'leaf' } };

  beforeEach(() => {
    jest.clearAllMocks();
    RepoState.clear();
  });

  test('should store the initial state in the private variable #state', () => {
    RepoState.initState(mockState);
    expect(RepoState.getSnapshot()).toEqual(mockState);
  })

  test('should throw an error if initState is called more than once', () => {
    RepoState.initState(mockState);
    expect(() => {
      RepoState.initState({ root: { branch: 'leaf' } });
    }).toThrowError();
  })

  test('should prevent external modifications to the internal state', () => {
    const state = { root: { branch: 'leaf' } };
    RepoState.initState(state);
    state.root.branch = 'fall';
    expect(RepoState.getSnapshot()).toEqual({ root: { branch: 'leaf' } });
  })

})

describe('addReducer Function', () => {

  const mockState = { root: { branch: 'leaf' } };

  beforeEach(() => {
    jest.clearAllMocks();
    RepoState.clear();
  });

  test('should correctly add reducers for different state paths and action types', () => {
    const mockReducerBranchSet = jest.fn();
    const mockReducerBranchRemove = jest.fn();
    const mockReducerBranchLeafSet = jest.fn();
    const mockReducerStateSet = jest.fn();
    const mockReducerStateRemove = jest.fn();

    RepoState.initState({ root: { branch: { leaf: 'bloom' } } });

    RepoState.addReducer('root.branch', 'set', mockReducerBranchSet);
    RepoState.addReducer('root.branch', 'remove', mockReducerBranchRemove);
    RepoState.addReducer('root.branch.leaf', 'set', mockReducerBranchLeafSet);
    RepoState.addReducer(null, 'set', mockReducerStateSet);
    RepoState.addReducer('@', 'remove', mockReducerStateRemove);

    expect(RepoState.getReducers()).toEqual({
      'root.branch': {
        'set': mockReducerBranchSet,
        'remove': mockReducerBranchRemove
      },
      'root.branch.leaf': {
        'set': mockReducerBranchLeafSet
      },
      '@': {
        'set': mockReducerStateSet,
        'remove': mockReducerStateRemove
      }
    });
  });

  test('should throw error if adding a second reducer to the same statePath and type', () => {
    const mockReducerBranchSet1 = jest.fn();
    const mockReducerBranchSet2 = jest.fn();

    RepoState.initState({ root: { branch: 'leaf' } });

    RepoState.addReducer('root.branch', 'set', mockReducerBranchSet1);

    expect(() => {
      RepoState.addReducer('root.branch', 'set', mockReducerBranchSet2);
    }).toThrowError('Reducer for statePath "root.branch" and type "set" already exists');
  });

  test('should throw error if adding a reducer for a non-existent statePath', () => {
    const mockReducer = jest.fn();

    RepoState.initState({ root: { trunk: 'leaf' } });

    expect(() => {
      RepoState.addReducer('root.branch', 'set', mockReducer);
    }).toThrowError('State path "root.branch" does not exist');
  });

})

