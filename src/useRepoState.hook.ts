import { useContext } from 'react';
import RepoContext from './RepoContext';
import type { UseRepoStateReturn, StatePath, ActionType } from './types';

function useRepoState<T = any>(statePath?: StatePath): UseRepoStateReturn<T> {
  const context = useContext(RepoContext);

  if (!context) {
    throw new Error('useRepoState must be used within a RepoState.Provider');
  }

  const { state, dispatch } = context;

  const getSubState = (state: any, statePath?: StatePath): T => {
    if (!statePath || statePath.toString().trim() === '@') return state;

    if (typeof statePath !== 'string') {
      throw new Error('statePath must be a string, null, undefined, or "@"');
    }

    const keys = statePath.trim().split('.');
    let subState = state;
    keys.forEach(key => subState = subState ? subState[key] : undefined);

    return subState;
  };

  const dispatchFn = (type: ActionType, value?: any): void => {
    const action = {
      statePath: statePath ? statePath.toString() : null,
      type,
      value
    };
    dispatch(action);
  };

  return [getSubState(state, statePath), dispatchFn];
}

export default useRepoState;