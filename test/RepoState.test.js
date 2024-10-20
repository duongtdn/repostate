"use strict"

import RepoState from 'RepoState'

describe('RepoState.initState', () => {

  const mockState = { root: { branch: 'leaf' } };

  beforeEach(() => {
    jest.clearAllMocks();
    RepoState.__clear();
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

describe('RepoState.addReducer', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    RepoState.__clear();
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

describe('RepoState.__dispatch (RepoState.#dispatchReducer)', () => {

  let mockReducerBranchSet;
  let mockReducerTrunkSet;
  let mockReducerRootSet;

  const state = {
    root: {
      trunk: {
        branch: 'leaf',
      },
      leaves: [
        { id: 1, name: 'Leaf 1' },
        { id: 2, name: 'Leaf 2' },
      ],
    }
  };

  const ensureOriginalStateWasNotMutated = () => {
    expect(state).toEqual({
      root: {
        trunk: {
          branch: 'leaf',
        },
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ],
      }
    });
  }

  beforeEach(() => {

    jest.clearAllMocks();
    RepoState.__clear();

    mockReducerBranchSet = jest.fn((state, value) => (value));
    mockReducerTrunkSet = jest.fn((state, value) => ({ ...state, ...value }));
    mockReducerRootSet = jest.fn((state, value) => ({
      ...state,
      root: {
        ...state.root,
        ...value.root
      }
    }));

    RepoState.initState(state);
    RepoState.addReducer('root.trunk.branch', 'set', mockReducerBranchSet);
    RepoState.addReducer('root.trunk', 'set', mockReducerTrunkSet);
    RepoState.addReducer('@', 'set', mockReducerRootSet);
  });

  test('should update state immutably for a valid statePath and type with correct reducer', () => {
    const statePath = 'root.trunk.branch';
    const type = 'set';
    const value = 'newLeaf';

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(mockReducerBranchSet).toHaveBeenCalledWith(
      'leaf', 'newLeaf'
    );

    expect(newState).toEqual({
      root: {
        trunk: {
          branch: 'newLeaf'
        },
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ]
      }
    });

    ensureOriginalStateWasNotMutated();
  });

  test('should apply root-level reducer when statePath is "@"', () => {
    const statePath = '@';
    const type = 'set';
    const value = { root: { trunk: 'newTrunk' } };

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(mockReducerRootSet).toHaveBeenCalledWith(state, value);

    expect(newState).toEqual({
      root: {
        trunk: 'newTrunk',
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ]
      }
    });

    ensureOriginalStateWasNotMutated();
  });

  test('should apply root-level reducer when statePath is null', () => {
    const statePath = null;
    const type = 'set';
    const value = { root: { trunk: 'newTrunk' } };

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(mockReducerRootSet).toHaveBeenCalledWith(state, value);

    expect(newState).toEqual({
      root: {
        trunk: 'newTrunk',
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ]
      }
    });

    ensureOriginalStateWasNotMutated();
  });

  test('should apply root-level reducer when statePath is undefined', () => {
    const statePath = undefined;
    const type = 'set';
    const value = { root: { trunk: 'newTrunk' } };

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(mockReducerRootSet).toHaveBeenCalledWith(state, value);

    expect(newState).toEqual({
      root: {
        trunk: 'newTrunk',
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ]
      }
    });

    ensureOriginalStateWasNotMutated();
  });

  test('should throw an error for nonexistant state path', () => {
    const statePath = 'root.nonExistent';
    const type = 'set';
    const value = 'newValue';

    expect(() => RepoState.__dispatch(statePath, type, value)).toThrowError('State path "root.nonExistent" does not exist');
  });

  test('should override the value as default reducer if type is null', () => {
    const statePath = 'root.trunk.branch';
    const type = null;
    const value = 'newBranch';

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(newState).toEqual({
      root: {
        trunk: {
          branch: 'newBranch',
        },
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ],
      }
    });
  });

  test('should override the value as default reducer if type is undefined', () => {
    const statePath = 'root.trunk.branch';
    const type = undefined;
    const value = 'newBranch';

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(newState).toEqual({
      root: {
        trunk: {
          branch: 'newBranch',
        },
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ],
      }
    });
  });

  test('should throw an error if no reducer exists for the given type within a valid statePath', () => {
    const statePath = 'root.trunk.branch';
    const type = 'remove';
    const value = null;

    expect(() => RepoState.__dispatch(statePath, type, value)).toThrowError('No reducer found for statePath: root.trunk.branch and type: remove');
  });

  test('should update nested state immutably when applying reducer to nested statePath', () => {
    const statePath = 'root.trunk';
    const type = 'set';
    const value = { branch: 'newLeaf' };

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(mockReducerTrunkSet).toHaveBeenCalledWith({ branch: 'leaf' }, value);

    expect(newState).toEqual({
      root: {
        trunk: {
          branch: 'newLeaf'
        },
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
        ],
      }
    });

    ensureOriginalStateWasNotMutated();

  });

  test('should append a new value to an array in the state immutably', () => {
    const mockAppendToLeaves = jest.fn((state, value) => [...state, value]);

    RepoState.addReducer('root.leaves', 'append', mockAppendToLeaves);

    const statePath = 'root.leaves';
    const type = 'append';
    const value = { id: 3, name: 'Leaf 3' };

    const newState = RepoState.__dispatch(statePath, type, value);

    expect(mockAppendToLeaves).toHaveBeenCalledWith(
      state.root.leaves,
      { id: 3, name: 'Leaf 3' }
    );

    expect(newState).toEqual({
      root: {
        trunk: {
          branch: 'leaf',
        },
        leaves: [
          { id: 1, name: 'Leaf 1' },
          { id: 2, name: 'Leaf 2' },
          { id: 3, name: 'Leaf 3' } // The newly added leaf
        ],
      }
    });

    ensureOriginalStateWasNotMutated();
  });

});


