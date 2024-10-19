"use strict"

import { useContext } from 'react';
import RepoContext from './RepoContext';

const useRepoState = (statePaths) => {
  const { state, dispatch } = useContext(RepoContext);

  const getSubState = (state, statePaths) => {
    if (!statePaths || statePaths === '@') return state;

    if (Array.isArray(statePaths)) {
      return statePaths.reduce((acc, path) => {
        const keys = path.split('.');
        let subState = state;
        keys.forEach(key => subState = subState ? subState[key] : undefined);

        const pathParts = path.split('.');
        let current = acc;
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          if (i === pathParts.length - 1) {
            current[part] = subState;
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        }

        return acc;
      }, {});
    }

    const keys = statePaths.split('.');
    let subState = state;
    keys.forEach(key => subState = subState ? subState[key] : undefined);
    return subState;
  };

  return [
    getSubState(state, statePaths),
    (statePath, type, value) => {
      const action = { statePath, type, value };
      dispatch(action);
    }
  ];
}

export default useRepoState;
