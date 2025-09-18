import RepoState from './RepoState';
import useRepoState from './useRepoState.hook';
import useRepoDispatch from './useRepoDispatch.hook';

// Attach hooks to the RepoState instance for convenience
RepoState.useRepoState = useRepoState;
RepoState.useRepoDispatch = useRepoDispatch;

export default RepoState;
export { useRepoState, useRepoDispatch };

// Export types for TypeScript users
export type {
  StateObject,
  Reducer,
  ReducerConfig,
  DispatchAction,
  DispatchFunction,
  UseRepoStateReturn,
  RepoContextValue,
  ProviderProps,
  StatePath,
  ActionType
} from './types';