"use strict"

import { useContext } from 'react';
import RepoContext from './RepoContext';

const useRepoState = (statePath) => {
  const { state, dispatch } = useContext(RepoContext);

  const getSubState = (state, statePath) => {
    if (!statePath || statePath.trim() === '@') return state;

    if (typeof statePath !== 'string') {
      throw new Error('statePath must be a string, null, undefined, or "@"');
    }

    const keys = statePath.trim().split('.');
    let subState = state;
    keys.forEach(key => subState = subState ? subState[key] : undefined);

    return subState;
  };

  return [
    getSubState(state, statePath),
    (type, value) => {
      const action = { statePath, type, value };
      dispatch(action);
    }
  ];
}

export default useRepoState;
