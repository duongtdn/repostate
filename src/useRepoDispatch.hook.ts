import { useContext } from 'react';
import RepoContext from './RepoContext';
import type { DispatchFunction, StatePath, ActionType } from './types';

const useRepoDispatch = (): DispatchFunction => {
  const context = useContext(RepoContext);

  if (!context) {
    throw new Error('useRepoDispatch must be used within a RepoState.Provider');
  }

  const { dispatch } = context;

  return (statePath: StatePath, type: ActionType, value?: any) => {
    const action = {
      statePath: statePath ? statePath.toString() : null,
      type,
      value
    };
    dispatch(action);
  };
};

export default useRepoDispatch;